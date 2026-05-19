import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import type { LoginInput, RegisterInput, RegisterSocietyInput } from "../validators/auth.validator.js";
import { User, type IUserDocument } from "../models/User.js";
import type { Role } from "../types/roles.js";
import { toClientRole, type ClientRole } from "../types/clientRole.js";
import { registerSocietyWithRelations } from "./societyRegistration.service.js";
import { assertUserCanLogin, attachSocietyContext } from "./userProfile.service.js";
import { httpError } from "../utils/httpError.js";

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  mobile: string | null;
  role: ClientRole;
  societyId: string | null;
  societyName: string | null;
  onboardingCompleted: boolean;
  superAdminResidencyCompleted: boolean;
  needsSuperAdminResidency: boolean;
  createdAt: Date;
};

async function toSafeUser(user: IUserDocument): Promise<SafeUser> {
  const society = await attachSocietyContext(user);
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    mobile: user.phone,
    role: toClientRole(user.role),
    societyId: society.societyId,
    societyName: society.societyName,
    onboardingCompleted: society.onboardingCompleted,
    superAdminResidencyCompleted: society.superAdminResidencyCompleted,
    needsSuperAdminResidency: society.needsSuperAdminResidency,
    createdAt: user.createdAt,
  };
}

function issueToken(user: { id: string; email: string; role: Role }) {
  return signAccessToken({ sub: user.id, email: user.email, role: user.role });
}

export async function registerUser(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw httpError("Email already registered", 409);

  const user = await User.create({
    email,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    phone: null,
    role: "MEMBER",
    isActive: false,
  });

  throw httpError(
    "Registration received. A society admin must add and approve you before you can sign in.",
    403,
  );
}

export async function registerSocietyAdmin(
  input: RegisterSocietyInput,
): Promise<{ user: SafeUser; token: string; onboardingRequired: boolean }> {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw httpError("Email already registered", 409);

  const { user, onboardingRequired } = await registerSocietyWithRelations(input);
  const safe = await toSafeUser(user);
  return {
    user: safe,
    token: issueToken({ id: safe.id, email: safe.email, role: user.role }),
    onboardingRequired,
  };
}

export async function loginUser(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw httpError("Invalid email or password", 401);
  }

  await assertUserCanLogin(user);

  const safe = await toSafeUser(user);
  return { user: safe, token: issueToken({ id: safe.id, email: safe.email, role: user.role }) };
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await User.findById(id);
  if (!user) return null;
  try {
    await assertUserCanLogin(user);
  } catch {
    return null;
  }
  return toSafeUser(user);
}

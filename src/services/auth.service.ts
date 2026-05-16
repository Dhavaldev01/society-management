import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import type { LoginInput, RegisterInput, RegisterSocietyInput } from "../validators/auth.validator.js";
import { User, type IUserDocument } from "../models/User.js";
import { Society } from "../models/Society.js";
import type { Role } from "../types/roles.js";

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  mobile: string | null;
  role: Role;
  societyId: string | null;
  societyName: string | null;
  createdAt: Date;
};

async function resolveSocietyName(societyId: IUserDocument["societyId"]): Promise<string | null> {
  if (!societyId) return null;
  const society = await Society.findById(societyId).select("name").lean();
  return society?.name ?? null;
}

async function toSafeUser(user: IUserDocument): Promise<SafeUser> {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    mobile: user.mobile,
    role: user.role,
    societyId: user.societyId?.toString() ?? null,
    societyName: await resolveSocietyName(user.societyId),
    createdAt: user.createdAt,
  };
}

function issueToken(user: { id: string; email: string; role: Role }) {
  return signAccessToken({ sub: user.id, email: user.email, role: user.role });
}

export async function registerUser(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    (err as Error & { statusCode: number }).statusCode = 409;
    throw err;
  }

  const user = await User.create({
    email,
    password: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    role: "RESIDENT",
  });

  const safe = await toSafeUser(user);
  return { user: safe, token: issueToken(safe) };
}

export async function registerSocietyAdmin(
  input: RegisterSocietyInput,
): Promise<{ user: SafeUser; token: string }> {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    (err as Error & { statusCode: number }).statusCode = 409;
    throw err;
  }

  const society = await Society.create({
    name: input.society.name.trim(),
    type: input.society.type,
    address: input.society.address.trim(),
    city: input.society.city.trim(),
    pincode: input.society.pincode.trim(),
    wings: input.society.wings,
    flats: input.society.flats,
    floors: input.society.floors,
  });

  try {
    const user = await User.create({
      email,
      password: await hashPassword(input.password),
      fullName: input.fullName.trim(),
      mobile: input.mobile?.trim() ?? null,
      role: "ADMIN",
      societyId: society._id,
    });

    const safe = await toSafeUser(user);
    return { user: safe, token: issueToken(safe) };
  } catch (error) {
    await Society.findByIdAndDelete(society._id);
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user || !(await verifyPassword(input.password, user.password))) {
    const err = new Error("Invalid email or password");
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const safe = await toSafeUser(user);
  return { user: safe, token: issueToken(safe) };
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await User.findById(id);
  return user ? toSafeUser(user) : null;
}

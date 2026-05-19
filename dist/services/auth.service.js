import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { toClientRole } from "../types/clientRole.js";
import { registerSocietyWithRelations } from "./societyRegistration.service.js";
import { assertUserCanLogin, attachSocietyContext } from "./userProfile.service.js";
import { httpError } from "../utils/httpError.js";
async function toSafeUser(user) {
    const society = await attachSocietyContext(user);
    return {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        mobile: user.phone,
        role: toClientRole(user.role),
        societyId: society.societyId,
        societyName: society.societyName,
        createdAt: user.createdAt,
    };
}
function issueToken(user) {
    return signAccessToken({ sub: user.id, email: user.email, role: user.role });
}
export async function registerUser(input) {
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing)
        throw httpError("Email already registered", 409);
    const user = await User.create({
        email,
        passwordHash: await hashPassword(input.password),
        fullName: input.fullName.trim(),
        phone: null,
        role: "MEMBER",
        isActive: false,
    });
    throw httpError("Registration received. A society admin must add and approve you before you can sign in.", 403);
}
export async function registerSocietyAdmin(input) {
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing)
        throw httpError("Email already registered", 409);
    const user = await registerSocietyWithRelations(input);
    const safe = await toSafeUser(user);
    return { user: safe, token: issueToken({ id: safe.id, email: safe.email, role: user.role }) };
}
export async function loginUser(input) {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw httpError("Invalid email or password", 401);
    }
    await assertUserCanLogin(user);
    const safe = await toSafeUser(user);
    return { user: safe, token: issueToken({ id: safe.id, email: safe.email, role: user.role }) };
}
export async function getUserById(id) {
    const user = await User.findById(id);
    if (!user)
        return null;
    try {
        await assertUserCanLogin(user);
    }
    catch {
        return null;
    }
    return toSafeUser(user);
}
//# sourceMappingURL=auth.service.js.map
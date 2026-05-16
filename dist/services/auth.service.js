import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { Society } from "../models/Society.js";
async function resolveSocietyName(societyId) {
    if (!societyId)
        return null;
    const society = await Society.findById(societyId).select("name").lean();
    return society?.name ?? null;
}
async function toSafeUser(user) {
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
function issueToken(user) {
    return signAccessToken({ sub: user.id, email: user.email, role: user.role });
}
export async function registerUser(input) {
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error("Email already registered");
        err.statusCode = 409;
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
export async function registerSocietyAdmin(input) {
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error("Email already registered");
        err.statusCode = 409;
        throw err;
    }
    const s = input.society;
    const society = await Society.create({
        name: s.name.trim(),
        type: s.type,
        address: s.address.trim(),
        city: s.city.trim(),
        pincode: s.pincode.trim(),
        wings: s.type === "APARTMENT" ? s.wings : 0,
        flats: s.type === "APARTMENT" ? s.flats : 0,
        floors: s.type === "APARTMENT" ? s.floors : 0,
        blocks: s.type === "BLOCK_WISE" ? s.blocks : 0,
        houses: s.type === "BLOCK_WISE" ? s.houses : 0,
        documents: {
            registrationCertificate: s.documents?.registrationCertificate ?? null,
            panOrGst: s.documents?.panOrGst ?? null,
        },
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
    }
    catch (error) {
        await Society.findByIdAndDelete(society._id);
        throw error;
    }
}
export async function loginUser(input) {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await verifyPassword(input.password, user.password))) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }
    const safe = await toSafeUser(user);
    return { user: safe, token: issueToken(safe) };
}
export async function getUserById(id) {
    const user = await User.findById(id);
    return user ? toSafeUser(user) : null;
}
//# sourceMappingURL=auth.service.js.map
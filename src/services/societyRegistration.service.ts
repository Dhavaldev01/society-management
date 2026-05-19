import mongoose from "mongoose";
import type { RegisterSocietyInput } from "../validators/auth.validator.js";
import type { SocietyLayoutType } from "../types/roles.js";
import { hashPassword } from "../utils/password.js";
import { Society, SocietyMember, User, type IUserDocument } from "../models/index.js";
import { writeAuditLog } from "./audit.service.js";

function structureMetaFromInput(s: RegisterSocietyInput["society"]): {
  layoutType: SocietyLayoutType;
  structureMeta: {
    wings: number;
    flats: number;
    floors: number;
    blocks: number;
    houses: number;
  };
} {
  if (s.type === "APARTMENT") {
    return {
      layoutType: "APARTMENT",
      structureMeta: { wings: s.wings, flats: s.flats, floors: s.floors, blocks: 0, houses: 0 },
    };
  }
  return {
    layoutType: "BLOCK_WISE",
    structureMeta: { wings: 0, flats: 0, floors: 0, blocks: s.blocks, houses: s.houses },
  };
}

/** Step 1: Register society → SUPER_ADMIN user + society + ACTIVE membership */
export async function registerSocietyWithRelations(
  input: RegisterSocietyInput,
): Promise<IUserDocument> {
  const email = input.email.toLowerCase();
  const { layoutType, structureMeta } = structureMetaFromInput(input.society);
  const passwordHash = await hashPassword(input.password);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createdUsers = await User.create(
      [
        {
          email,
          passwordHash,
          fullName: input.fullName.trim(),
          phone: input.mobile?.trim() || null,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      ],
      { session },
    );
    const user = createdUsers[0];
    if (!user) throw new Error("Failed to create user");

    const createdSocieties = await Society.create(
      [
        {
          name: input.society.name.trim(),
          address: input.society.address.trim(),
          city: input.society.city.trim(),
          state: "",
          pincode: input.society.pincode.trim(),
          layoutType,
          structureMeta,
          documents: {
            registrationCertificate: input.society.documents?.registrationCertificate ?? null,
            panOrGst: input.society.documents?.panOrGst ?? null,
          },
          createdBy: user._id,
        },
      ],
      { session },
    );
    const society = createdSocieties[0];
    if (!society) throw new Error("Failed to create society");

    await SocietyMember.create(
      [
        {
          societyId: society._id,
          userId: user._id,
          unitId: null,
          flatNumber: "",
          floorNumber: 0,
          ownershipType: "OWNER",
          status: "ACTIVE",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    await writeAuditLog({
      action: "SOCIETY_REGISTERED",
      performedBy: user._id,
      societyId: society._id,
      after: { societyId: society._id.toString(), superAdminId: user._id.toString() },
    });

    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

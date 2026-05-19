import mongoose from "mongoose";
import type { RegisterSocietyInput } from "../validators/auth.validator.js";
import type { SocietyLayoutType } from "../types/roles.js";
import { hashPassword } from "../utils/password.js";
import { Society, SocietyMember, User, type IUserDocument } from "../models/index.js";
import { writeAuditLog } from "./audit.service.js";
import { generateUnitsAndProperties } from "./structureGenerator.service.js";

function structureMetaFromInput(s: RegisterSocietyInput["society"]): {
  layoutType: SocietyLayoutType;
  structureMeta: {
    wings: number;
    flats: number;
    floors: number;
    flatsPerFloor: number;
    blocks: number;
    houses: number;
    housesPerBlock: number;
  };
} {
  if (s.type === "APARTMENT") {
    const flatsPerFloor = s.flatsPerFloor > 0 ? s.flatsPerFloor : s.flats;
    return {
      layoutType: "APARTMENT",
      structureMeta: {
        wings: s.wings,
        flats: flatsPerFloor,
        floors: s.floors,
        flatsPerFloor,
        blocks: 0,
        houses: 0,
        housesPerBlock: 0,
      },
    };
  }
  const housesPerBlock = s.housesPerBlock > 0 ? s.housesPerBlock : s.houses;
  return {
    layoutType: "BLOCK_WISE",
    structureMeta: {
      wings: 0,
      flats: 0,
      floors: 0,
      flatsPerFloor: 0,
      blocks: s.blocks,
      houses: housesPerBlock,
      housesPerBlock,
    },
  };
}

/** Register society → SUPER_ADMIN user + society + units/properties + ADMIN membership */
export async function registerSocietyWithRelations(
  input: RegisterSocietyInput,
): Promise<{ user: IUserDocument; societyId: string; onboardingRequired: boolean }> {
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

    await generateUnitsAndProperties(society, session);

    await SocietyMember.create(
      [
        {
          societyId: society._id,
          userId: user._id,
          propertyId: null,
          societyRole: "ADMIN",
          isResident: false,
          isPrimaryOwner: false,
          onboardingCompleted: false,
          superAdminResidencyCompleted: false,
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

    return {
      user,
      societyId: society._id.toString(),
      onboardingRequired: true,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

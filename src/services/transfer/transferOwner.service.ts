import mongoose, { type Types } from "mongoose";
import { SocietyMember } from "../../models/index.js";
import { httpError } from "../../utils/httpError.js";
import { writeAuditLog } from "../audit.service.js";
import { closeOpenHistory, openHistory } from "../propertyHistory.service.js";
import { clearPrimaryOwner } from "../societyMemberResidency.service.js";
import { findPropertyForMember, syncMemberFromProperty } from "../property.service.js";

export async function transferOwner(
  societyId: Types.ObjectId,
  performedBy: Types.ObjectId,
  input: { propertyId: string; newOwnerMemberId: string },
) {
  if (!mongoose.isValidObjectId(input.propertyId) || !mongoose.isValidObjectId(input.newOwnerMemberId)) {
    throw httpError("Invalid ids", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const propertyObjectId = new mongoose.Types.ObjectId(input.propertyId);
    await findPropertyForMember(societyId, propertyObjectId);

    const newOwner = await SocietyMember.findOne({
      _id: input.newOwnerMemberId,
      societyId,
      status: "ACTIVE",
    }).session(session);

    if (!newOwner) throw httpError("New owner member not found", 404);

    const oldPrimary = await SocietyMember.find({
      propertyId: propertyObjectId,
      isPrimaryOwner: true,
      status: "ACTIVE",
    }).session(session);

    for (const old of oldPrimary) {
      if (old._id.equals(newOwner._id)) continue;
      old.isPrimaryOwner = false;
      await closeOpenHistory(old._id, session);
      await old.save({ session });
    }

    await clearPrimaryOwner(propertyObjectId, session);

    newOwner.societyRole = "OWNER";
    newOwner.ownershipType = "OWNER";
    newOwner.isPrimaryOwner = true;
    await syncMemberFromProperty(newOwner, propertyObjectId);
    await newOwner.save({ session });

    await closeOpenHistory(newOwner._id, session);
    await openHistory(
      {
        societyId,
        userId: newOwner.userId,
        propertyId: propertyObjectId,
        societyMemberId: newOwner._id,
        role: "OWNER",
      },
      session,
    );

    await session.commitTransaction();

    await writeAuditLog({
      action: "OWNER_TRANSFERRED",
      performedBy,
      societyId,
      after: {
        propertyId: input.propertyId,
        newOwnerMemberId: input.newOwnerMemberId,
      },
    });

    return newOwner;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

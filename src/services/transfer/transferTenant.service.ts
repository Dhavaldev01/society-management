import mongoose, { type Types } from "mongoose";
import { Family, SocietyMember } from "../../models/index.js";
import { httpError } from "../../utils/httpError.js";
import { writeAuditLog } from "../audit.service.js";
import { closeOpenHistory, openHistory } from "../propertyHistory.service.js";
import { findPropertyForMember, syncMemberFromProperty } from "../property.service.js";

export async function transferTenant(
  societyId: Types.ObjectId,
  performedBy: Types.ObjectId,
  input: { societyMemberId: string; newPropertyId: string; moveFamily?: boolean },
) {
  if (!mongoose.isValidObjectId(input.societyMemberId) || !mongoose.isValidObjectId(input.newPropertyId)) {
    throw httpError("Invalid ids", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const member = await SocietyMember.findOne({
      _id: input.societyMemberId,
      societyId,
      societyRole: "TENANT",
      status: "ACTIVE",
    }).session(session);

    if (!member) throw httpError("Tenant member not found", 404);
    if (!member.isResident) throw httpError("Tenant must be a resident", 400);

    const newPropertyId = new mongoose.Types.ObjectId(input.newPropertyId);
    await findPropertyForMember(societyId, newPropertyId);

    await closeOpenHistory(member._id, session);

    await syncMemberFromProperty(member, newPropertyId);
    await member.save({ session });

    await openHistory(
      {
        societyId,
        userId: member.userId,
        propertyId: newPropertyId,
        societyMemberId: member._id,
        role: "TENANT",
      },
      session,
    );

    if (input.moveFamily !== false) {
      await Family.updateOne(
        { societyMemberId: member._id },
        { propertyId: newPropertyId },
        { session },
      );
    }

    await session.commitTransaction();

    await writeAuditLog({
      action: "TENANT_TRANSFERRED",
      performedBy,
      societyId,
      after: {
        memberId: member._id.toString(),
        newPropertyId: input.newPropertyId,
      },
    });

    return member;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

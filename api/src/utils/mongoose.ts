import mongoose, { ClientSession } from "mongoose";

export const handleTransaction = async (
  fn: (session: ClientSession) => Promise<void>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await fn(session);
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

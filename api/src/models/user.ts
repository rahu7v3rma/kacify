import { Schema, model } from "mongoose";
import { UserType } from "../utils/types";

const schema = new Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
  },
  forgotPasswordToken: {
    type: Number,
    default: null,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "vendor"],
  },
  permissions: {
    type: [String],
    default: [],
  },
});

export const UserModelName = "User";

const UserModel = model<UserType>(UserModelName, schema);

UserModel.syncIndexes();

export default UserModel;

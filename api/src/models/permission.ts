import { Schema, model } from "mongoose";
import { PermissionType } from "../utils/types";

const schema = new Schema<PermissionType>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
  },
});

export const PermissionModelName = "Permission";

const PermissionModel = model<PermissionType>(PermissionModelName, schema);

export default PermissionModel;

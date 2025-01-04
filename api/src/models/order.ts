import { Schema, model } from "mongoose";
import { OrderType } from "../utils/types";
import { CartModelName } from "./cart";
import { UserModelName } from "./user";

const schema = new Schema<OrderType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: UserModelName,
    required: true,
  },
  cart: {
    type: [Schema.Types.ObjectId],
    ref: CartModelName,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const OrderModelName = "Order";

const OrderModel = model<OrderType>(OrderModelName, schema);

OrderModel.syncIndexes();

export default OrderModel;

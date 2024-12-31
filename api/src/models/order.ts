import { Schema, model } from "mongoose";
import { CartType, OrderType } from "../utils/types";
import { CartModelName } from "./cart";

const schema = new Schema<OrderType>({
  cart: {
    type: Schema.Types.ObjectId,
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

const OrderModel = model<CartType>(OrderModelName, schema);

OrderModel.syncIndexes();

export default OrderModel;

import { Schema, model } from "mongoose";
import { CartType } from "../utils/types";
import { ProductModelName } from "./product";

const schema = new Schema<CartType>({
  products: {
    type: [Schema.Types.ObjectId],
    ref: ProductModelName,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

export const CartModelName = "Cart";

const CartModel = model<CartType>(CartModelName, schema);

CartModel.syncIndexes();

export default CartModel;

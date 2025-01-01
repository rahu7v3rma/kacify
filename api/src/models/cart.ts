import { Schema, model } from "mongoose";
import { CartProductType, CartType } from "../utils/types";
import { ProductModelName } from "./product";
import { UserModelName } from "./user";

export const CartModelName = "Cart";
export const CartProductModelName = "CartProduct";

const cartProductSchema = new Schema<CartProductType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: UserModelName,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: ProductModelName,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

export const CartProductModel = model<CartProductType>(
  CartProductModelName,
  cartProductSchema
);

CartProductModel.syncIndexes();

import { Schema, model } from "mongoose";
import { CartProductType, CartType } from "../utils/types";
import { ProductModelName } from "./product";
import { UserModelName } from "./user";

export const CartModelName = "Cart";
export const CartProductModelName = "CartProduct";

const cartSchema = new Schema<CartType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: UserModelName,
    required: true,
  },
  products: {
    type: [Schema.Types.ObjectId],
    ref: CartProductModelName,
    required: true,
  },
});

const cartProductSchema = new Schema<CartProductType>({
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

const CartModel = model<CartType>(CartModelName, cartSchema);
export const CartProductModel = model<CartProductType>(
  CartProductModelName,
  cartProductSchema
);

CartModel.syncIndexes();
CartProductModel.syncIndexes();

export default CartModel;

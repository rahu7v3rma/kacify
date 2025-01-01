import { Document, Types } from "mongoose";

export interface ProductType extends Document {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  user: Types.ObjectId | UserType | string;
}

export interface UserType extends Document {
  _id: string;
  email: string;
  password: string;
  forgotPasswordToken: number | null;
  role: "user" | "admin" | "vendor";
  permissions: string[];
  cart: Types.ObjectId | CartType[] | string;
  orders: Types.ObjectId | OrderType[] | string;
}

export interface CartProductType extends Document {
  product: Types.ObjectId | ProductType | string;
  quantity: number;
}

export interface CartType extends Document {
  user: Types.ObjectId | UserType | string;
  products: Types.ObjectId | CartProductType[] | string;
}

export interface OrderType extends Document {
  cart: CartType[] | Types.ObjectId | string;
  address: string;
  email: string;
}

import { z } from "zod";
import { UserType } from "./types";
import { Types } from "mongoose";

export const UserCheckoutResponseDataSchema = z.object({
  cart: z.custom<UserType["cart"]>(),
  clientSecret: z.string(),
});

export const CartGetResponseDataSchema = z.array(
  z.object({
    product: z.object({
      _id: z.custom<Types.ObjectId>(),
      name: z.string(),
    }),
    quantity: z.number(),
  })
);

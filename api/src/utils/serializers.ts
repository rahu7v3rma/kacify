import { Types } from "mongoose";
import { z } from "zod";

export const GetOrderResponseDataSchema = z.object({
  cart: z.object({
    product: z.object({
      _id: z.custom<Types.ObjectId>(),
      name: z.string(),
      price: z.number(),
    }),
    quantity: z.number(),
  }),
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

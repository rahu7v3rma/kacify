import { z } from "zod";

export const GetOrderResponseDataSchema = z.object({
  cart: z.array(
    z.object({
      product: z.object({
        name: z.string(),
        price: z.number(),
      }),
      quantity: z.number(),
    })
  ),
  clientSecret: z.string(),
});

export const GetCartResponseDataSchema = z.array(
  z.object({
    product: z.object({
      name: z.string(),
      price: z.number(),
    }),
    quantity: z.number(),
  })
);

import { z } from "zod";

export const CartGetResponseDataSchema = z.array(
  z.object({
    product: z.object({
      _id: z.string(),
      name: z.string(),
    }),
    quantity: z.number(),
  })
);

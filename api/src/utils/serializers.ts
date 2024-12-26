import { z } from "zod";
import { UserType } from "./types";

export const UserCheckoutResponseDataSchema = z.object({
  cart: z.custom<UserType["cart"]>(),
  clientSecret: z.string(),
});

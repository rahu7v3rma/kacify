import { ZodSchema } from "zod";
import { UserType } from "./types";

declare global {
  namespace Express {
    interface Request {
      user: UserType;
    }
    interface Response {
      success: boolean;
      message: string;
      data: any;
      schema: ZodSchema
      defaultData: any
    }
  }
}

export {};

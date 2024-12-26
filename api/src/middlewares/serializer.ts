import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export const responseSerializeHandler =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    try {
      const responseData: any = {};
      const parse = schema.safeParse(res.data);
      if (parse.success) {
        responseData.data = parse.data;
      }
      res.json({
        success: res?.success ?? true,
        message: res?.message ?? "Success",
        data: responseData,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

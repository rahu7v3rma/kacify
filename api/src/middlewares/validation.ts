import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export const requestBodyValidationHandler = (
  schema: ZodSchema
): RequestHandler => {
  return (req, res, next) => {
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        message: JSON.stringify(parse.error.format()),
      });
      return;
    }
    req.body = parse.data;
    next();
  };
};

export const requestParamsValidationHandler = (
  schema: ZodSchema
): RequestHandler => {
  return (req, res, next) => {
    const parse = schema.safeParse(req.params);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        message: JSON.stringify(parse.error.format()),
      });
      return;
    }
    req.params = parse.data;
    next();
  };
};

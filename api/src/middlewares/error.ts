import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { handleError } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = async (
  error,
  req,
  res,
  next
) => {
  res.json({
    success: false,
    message: "internal server error",
    data: res.data ?? res.defaultData ?? {},
  });
  handleError(error);
};

export const errorCatcher = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

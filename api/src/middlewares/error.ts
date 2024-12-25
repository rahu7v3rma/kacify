import { ErrorRequestHandler } from "express";
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
  });
  handleError(error);
};

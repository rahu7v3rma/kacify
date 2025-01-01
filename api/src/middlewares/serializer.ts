import { RequestHandler } from "express";

export const responseSerializer: RequestHandler = (req, res, next) => {
  try {
    res.json({
      success: res?.success ?? true,
      message: res?.message ?? res?.success ? "Success" : "Failed",
      data: res.data ?? {},
    });
    return;
  } catch (error) {
    next(error);
  }
};

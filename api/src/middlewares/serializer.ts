import { RequestHandler } from "express";

export const responseSerializeHandler: RequestHandler = (req, res) => {
  res.json({
    success: res?.success ?? true,
    message: res?.message ?? "Success",
    data: res?.data ?? {},
  });
  return;
};

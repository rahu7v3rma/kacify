import { Router } from "express";
import { z } from "zod";
import { requestBodyValidationHandler } from "../middlewares/validation";
import { handleError } from "../utils/logger";
import { LogErrorRequestBodySchema } from "../utils/zod";

const LogRouter = Router();

LogRouter.post(
  "/error",
  requestBodyValidationHandler(LogErrorRequestBodySchema),
  (req, res, next) => {
    try {
      const { data } = req.body as z.infer<typeof LogErrorRequestBodySchema>;
      handleError(data);
      res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default LogRouter;

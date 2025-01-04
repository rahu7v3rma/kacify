import { Router } from "express";
import { z } from "zod";
import { requestBodyValidationHandler } from "../middlewares/validation";
import { handleError } from "../utils/logger";
import { LogErrorRequestBodySchema } from "../utils/zod";
import { errorCatcher } from "../middlewares/error";

const LogRouter = Router();

LogRouter.post(
  "/error",
  requestBodyValidationHandler(LogErrorRequestBodySchema),
  errorCatcher((req, res, next) => {
    const { data } = req.body as z.infer<typeof LogErrorRequestBodySchema>;
    handleError(data);
    res.json({
      success: true,
    });
  })
);

export default LogRouter;

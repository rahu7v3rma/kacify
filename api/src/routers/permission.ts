import { Router } from "express";
import { z } from "zod";
import { authHandler, roleHandler } from "../middlewares/auth";
import { errorCatcher } from "../middlewares/error";
import PermissionModel from "../models/permission";
import {
  PermissionAddRequestBodySchema
} from "../utils/zod";

const PermissionRouter = Router();

PermissionRouter.post(
  "/",
  authHandler,
  roleHandler(["admin"]),
  errorCatcher(async (req, res, next) => {
    const { name, description } = req.body as z.infer<
      typeof PermissionAddRequestBodySchema
    >;

    await PermissionModel.create({ name, description });

    res.json({
      success: true,
      message: "Permission added successfully",
      data: null,
    });
  })
);

PermissionRouter.get(
  "/",
  authHandler,
  roleHandler(["admin"]),
  errorCatcher(async (req, res, next) => {
    const permissions = await PermissionModel.find();

    res.json({
      success: true,
      message: "Permissions found",
      data: permissions,
    });
  })
);

export default PermissionRouter;

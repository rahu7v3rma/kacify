import { RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import { decodeJwt } from "../utils/jwt";
import { errorCatcher } from "./error";

export const authHandler: RequestHandler = errorCatcher(
  async (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }
    const decodedJwt = decodeJwt(authToken);
    const userId = (decodedJwt as JwtPayload)["_id"];
    if (!userId) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }
    req.user = user;
    next();
  }
);

export const roleHandler = (roles: string[]): RequestHandler =>
  errorCatcher(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }
    next();
  });

export const permissionHandler = (permissions: string[]): RequestHandler =>
  errorCatcher(async (req, res, next) => {
    if (
      !permissions.every((permission) =>
        req.user.permissions.includes(permission)
      )
    ) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }
    next();
  });

import dotenv from "dotenv";
import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { authHandler, roleHandler } from "../middlewares/auth";
import { requestBodyValidationHandler } from "../middlewares/validation";
import UserModel from "../models/user";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { encodeJwt } from "../utils/jwt";
import { sendForgotPasswordEmail } from "../utils/nodemailer";
import {
  AddUserRequestBodySchema,
  ChangePasswordRequestBodySchema,
  ForgotPasswordRequestBodySchema,
  LoginRequestBodySchema,
  RegisterRequestBodySchema,
} from "../utils/zod";
import { errorCatcher } from "../middlewares/error";

dotenv.config({});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const UserRouter = Router();

UserRouter.post(
  "/register",
  requestBodyValidationHandler(RegisterRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { email, password, role } = req.body as z.infer<
      typeof RegisterRequestBodySchema
    >;

    if (await UserModel.exists({ email })) {
      res.send({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    await UserModel.create({
      email,
      password: hashPassword(password),
      role,
    });
    res.send({
      success: true,
      message: "User registered successfully",
    });
    return;
  })
);

UserRouter.post(
  "/login",
  requestBodyValidationHandler(LoginRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { email, password, role } = req.body as z.infer<
      typeof LoginRequestBodySchema
    >;

    const user = await UserModel.findOne({ email, role });
    if (!user || !comparePassword(password, user.password)) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }

    res.send({
      success: true,
      data: encodeJwt({ _id: user._id }),
    });

    return;
  })
);

UserRouter.get(
  "/profile",
  authHandler,
  errorCatcher(async (req, res, next) => {
    res.send({
      success: true,
      data: {
        _id: req.user?._id,
        email: req.user?.email,
      },
    });
    return;
  })
);

UserRouter.post(
  "/forgotPassword",
  requestBodyValidationHandler(ForgotPasswordRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { email } = req.body as z.infer<
      typeof ForgotPasswordRequestBodySchema
    >;

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }

    user.forgotPasswordToken = Math.floor(Math.random() * 1000000);
    await user.save();

    await sendForgotPasswordEmail(user.email, user.forgotPasswordToken);
    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });

    return;
  })
);

UserRouter.post(
  "/changePassword",
  requestBodyValidationHandler(ChangePasswordRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { password, token } = req.body as z.infer<
      typeof ChangePasswordRequestBodySchema
    >;

    const [email, forgotPasswordToken] = token.split("|");
    const user = await UserModel.findOne({ email });
    if (!user || user.forgotPasswordToken !== parseInt(forgotPasswordToken)) {
      res.send({
        success: false,
        message: "unauthorized",
      });
      return;
    }

    await user.updateOne({ password: hashPassword(password) });

    res.send({
      success: true,
      message: "Password changed successfully",
    });

    return;
  })
);

UserRouter.get(
  "/users",
  authHandler,
  roleHandler(["admin"]),
  errorCatcher(async (req, res, next) => {
    const users = await UserModel.find({}).select("_id email");
    res.send({
      success: true,
      data: users,
    });
    return;
  })
);

UserRouter.delete(
  "/:userId",
  authHandler,
  roleHandler(["admin"]),
  errorCatcher(async (req, res, next) => {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.send({
        success: false,
        message: "User not found",
      });
      return;
    }
    await user.deleteOne();
    res.send({
      success: true,
      message: "User deleted",
    });
    return;
  })
);

UserRouter.get(
  "/all",
  authHandler,
  roleHandler(["admin"]),
  errorCatcher(async (req, res, next) => {
    res.send({
      success: true,
      data: await UserModel.find({
        role: { $ne: "admin" },
      }).select("_id email role"),
    });
    return;
  })
);

UserRouter.post(
  "/",
  authHandler,
  roleHandler(["admin"]),
  requestBodyValidationHandler(AddUserRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { email, role, password } = req.body as z.infer<
      typeof AddUserRequestBodySchema
    >;

    await UserModel.create({
      email,
      role,
      password: hashPassword(password),
    });

    res.send({
      success: true,
      message: "User added successfully",
    });

    return;
  })
);

export default UserRouter;

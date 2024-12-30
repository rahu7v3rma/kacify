import dotenv from "dotenv";
import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { authHandler, roleHandler } from "../middlewares/auth";
import { responseSerializeHandler } from "../middlewares/serializer";
import { requestBodyValidationHandler } from "../middlewares/validation";
import UserModel from "../models/user";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { encodeJwt } from "../utils/jwt";
import { sendForgotPasswordEmail } from "../utils/nodemailer";
import { UserCheckoutResponseDataSchema } from "../utils/serializers";
import { ProductType, UserType } from "../utils/types";
import {
  AddToCartRequestBodySchema,
  AddUserRequestBodySchema,
  ChangePasswordRequestBodySchema,
  CheckoutConfirmRequestBodySchema,
  ForgotPasswordRequestBodySchema,
  LoginRequestBodySchema,
  RegisterRequestBodySchema,
} from "../utils/zod";

dotenv.config({});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const UserRouter = Router();

UserRouter.post(
  "/register",
  requestBodyValidationHandler(RegisterRequestBodySchema),
  async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.post(
  "/login",
  requestBodyValidationHandler(LoginRequestBodySchema),
  async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.get("/profile", authHandler, async (req, res, next) => {
  try {
    res.send({
      success: true,
      data: {
        _id: req.user?._id,
        email: req.user?.email,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
});

UserRouter.post(
  "/forgotPassword",
  requestBodyValidationHandler(ForgotPasswordRequestBodySchema),
  async (req, res, next) => {
    try {
      const { email } = req.body as z.infer<
        typeof ForgotPasswordRequestBodySchema
      >;

      const user = await UserModel.findOne({ email });
      if (!user || user.role !== "user") {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.post(
  "/changePassword",
  requestBodyValidationHandler(ChangePasswordRequestBodySchema),
  async (req, res, next) => {
    try {
      const { password, token } = req.body as z.infer<
        typeof ChangePasswordRequestBodySchema
      >;

      const [email, forgotPasswordToken] = token.split("|");
      const user = await UserModel.findOne({ email });
      if (
        !user ||
        user.forgotPasswordToken !== parseInt(forgotPasswordToken) ||
        user.role !== "user"
      ) {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.get(
  "/users",
  authHandler,
  roleHandler(["admin"]),
  async (req, res, next) => {
    try {
      const users = await UserModel.find({}).select("_id email");
      res.send({
        success: true,
        data: users,
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.delete(
  "/:userId",
  authHandler,
  roleHandler(["admin"]),
  async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.post(
  "/cart",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(AddToCartRequestBodySchema),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body as z.infer<
        typeof AddToCartRequestBodySchema
      >;
      const user = req.user as UserType;

      await user.updateOne({
        $push: {
          cart: {
            product: productId,
            quantity,
          },
        },
      });

      res.send({
        success: true,
        message: "Product added to cart",
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.get(
  "/all",
  authHandler,
  roleHandler(["admin"]),
  async (req, res, next) => {
    try {
      res.send({
        success: true,
        data: await UserModel.find({
          role: { $ne: "admin" },
        }).select("_id email role"),
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.post(
  "/",
  authHandler,
  roleHandler(["admin"]),
  requestBodyValidationHandler(AddUserRequestBodySchema),
  async (req, res, next) => {
    try {
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
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.get(
  "/cart",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      req.user = await req.user.populate("cart.product");
      res.send({
        success: true,
        data: req.user.cart,
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.put(
  "/cart/:productId/:quantity",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const quantity = parseInt(req.params.quantity);
      await UserModel.findOneAndUpdate(
        {
          _id: req.user._id,
          "cart.product": productId,
        },
        {
          $set: {
            "cart.$.quantity": quantity,
          },
        }
      );
      res.json({
        success: true,
        message: "Cart updated",
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.delete(
  "/cart/:productId",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      const productId = req.params.productId;
      await req.user.updateOne({
        $pull: {
          cart: {
            product: productId,
          },
        },
      });
      res.json({
        success: true,
        message: "Product removed from cart",
      });
      return;
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.get(
  "/checkout",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      req.user = await req.user.populate("cart.product");

      const totalAmount = req.user.cart.reduce(
        (acc, cartItem) =>
          acc + (cartItem.product as ProductType).price * cartItem.quantity,
        0
      );

      let clientSecret = "";
      if (totalAmount) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount * 100,
          currency: process.env.STRIPE_CURRENCY!,
        });
        if (paymentIntent.client_secret) {
          clientSecret = paymentIntent.client_secret;
        }
      }

      res.data = UserCheckoutResponseDataSchema.parse({
        cart: req.user.cart,
        clientSecret,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
);

UserRouter.post(
  "/checkout",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(CheckoutConfirmRequestBodySchema),
  async (req, res, next) => {
    try {
      const { paymentIntentId, address, email } = req.body as z.infer<
        typeof CheckoutConfirmRequestBodySchema
      >;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        res.json({
          success: false,
          message: "Payment failed",
        });
        return;
      }

      req.user.orders.push({
        products: req.user.cart,
        address,
        email,
      });
      req.user.cart = [];
      await req.user.save();

      res.json({
        success: true,
      });

      return;
    } catch (error) {
      next(error);
    }
  }
);

export default UserRouter;

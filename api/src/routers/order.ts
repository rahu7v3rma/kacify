import { Router } from "express";
import { authHandler, roleHandler } from "../middlewares/auth";
import { requestBodyValidationHandler } from "../middlewares/validation";
import { CheckoutConfirmRequestBodySchema } from "../utils/zod";
import { CartProductModel } from "../models/cart";
import { ProductType } from "../utils/types";
import Stripe from "stripe";
import { GetOrderResponseDataSchema } from "../utils/serializers";
import { errorCatcher } from "../middlewares/error";
import OrderModel from "../models/order";
import { z } from "zod";
import { sendOrderEmail } from "../utils/nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const OrderRouter = Router();

OrderRouter.get(
  "/",
  authHandler,
  roleHandler(["user"]),
  errorCatcher(async (req, res, next) => {
    const cart = await CartProductModel.find({ user: req.user._id })
      .populate("product")
      .lean();

    const totalAmount = cart.reduce((acc, cartProduct) => {
      const product = cartProduct.product as ProductType;
      return acc + product.price * cartProduct.quantity;
    }, 0);

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

    res.json({
      success: true,
      message: "Successfully fetched order",
      data: GetOrderResponseDataSchema.parse({
        cart,
        clientSecret,
      }),
    });

    return;
  })
);

OrderRouter.post(
  "/",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(CheckoutConfirmRequestBodySchema),
  errorCatcher(async (req, res, next) => {
    const { paymentIntentId, address, email } = req.body as z.infer<
      typeof CheckoutConfirmRequestBodySchema
    >;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      res.json({
        success: false,
        message: "Payment failed",
        data: null,
      });
      return;
    }

    const cart = await CartProductModel.find({ user: req.user._id });

    await OrderModel.create({
      user: req.user._id,
      cart,
      address,
      email,
    });

    const orderInfo = JSON.stringify(cart) + address;

    await sendOrderEmail(email, orderInfo);

    res.json({
      success: true,
      message: "order placed",
      data: null,
    });

    return;
  })
);

export default OrderRouter;

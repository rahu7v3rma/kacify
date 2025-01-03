import { Router } from "express";
import { authHandler, roleHandler } from "../middlewares/auth";
import { requestBodyValidationHandler } from "../middlewares/validation";
import { CheckoutConfirmRequestBodySchema } from "../utils/zod";
import { CartProductModel } from "../models/cart";
import { ProductType } from "../utils/types";
import Stripe from "stripe";
import { GetOrderResponseDataSchema } from "../utils/serializers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const OrderRouter = Router();

OrderRouter.get(
  "/",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
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

      res.data = GetOrderResponseDataSchema.parse({
        cart,
        clientSecret,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
);

OrderRouter.post(
  "/",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(CheckoutConfirmRequestBodySchema),
  async (req, res, next) => {
    try {
      // const { paymentIntentId, address, email } = req.body as z.infer<
      //   typeof CheckoutConfirmRequestBodySchema
      // >;

      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   paymentIntentId
      // );

      // if (paymentIntent.status !== "succeeded") {
      //   res.json({
      //     success: false,
      //     message: "Payment failed",
      //   });
      //   return;
      // }

      // req.user.orders.push({
      //   products: req.user.cart,
      //   address,
      //   email,
      // });
      // req.user.cart = [];
      // await req.user.save();

      // res.json({
      //   success: true,
      // });

      return;
    } catch (error) {
      next(error);
    }
  }
);

export default OrderRouter;

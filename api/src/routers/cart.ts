import { Router } from "express";
import { authHandler, roleHandler } from "../middlewares/auth";
import { requestBodyValidationHandler } from "../middlewares/validation";
import { AddToCartRequestBodySchema } from "../utils/zod";
import UserModel from "../models/user";
import { UserType } from "../utils/types";
import { z } from "zod";
import CartModel, { CartProductModel } from "../models/cart";
import { handleTransaction } from "../utils/mongoose";
import ProductModel from "../models/product";

const CartRouter = Router();

CartRouter.post(
  "/",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(AddToCartRequestBodySchema),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body as z.infer<
        typeof AddToCartRequestBodySchema
      >;
      const user = req.user as UserType;

      const product = await ProductModel.findById(productId);
      if (!product) {
        res.json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      await handleTransaction(async (session) => {
        const cartProduct = new CartProductModel({
          product: product._id,
          quantity,
        });
        await cartProduct.save({ session });

        const cart = new CartModel({
          user: user._id,
          products: [cartProduct._id],
        });
        await cart.save({ session });
      });

      next();
    } catch (error) {
      next(error);
    }
  }
);

CartRouter.get(
  "/",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      console.log(await req.user.populate("cart"));
      console.log(req.user.cart);
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

CartRouter.put(
  "/:cartId/:quantity",
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

CartRouter.delete(
  "/:cartId",
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

export default CartRouter;

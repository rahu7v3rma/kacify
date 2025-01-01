import { Router } from "express";
import { z } from "zod";
import { authHandler, roleHandler } from "../middlewares/auth";
import {
  requestBodyValidationHandler,
  requestParamsValidationHandler,
} from "../middlewares/validation";
import { CartProductModel } from "../models/cart";
import ProductModel from "../models/product";
import { CartGetResponseDataSchema } from "../utils/serializers";
import { UserType } from "../utils/types";
import {
  AddToCartRequestBodySchema,
  DeleteCartProductRequestParamSchema,
  UpdateCartRequestParamSchema,
} from "../utils/zod";

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

      await CartProductModel.create({
        user: user._id,
        product: product._id,
        quantity,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
);

CartRouter.get(
  "/products",
  authHandler,
  roleHandler(["user"]),
  async (req, res, next) => {
    try {
      res.defaultData = [];

      const cartProducts = await CartProductModel.find({
        user: req.user._id,
      }).populate("product");

      res.data = CartGetResponseDataSchema.parse(cartProducts);

      next();
    } catch (error) {
      next(error);
    }
  }
);

CartRouter.put(
  "/:productId/:quantity",
  authHandler,
  roleHandler(["user"]),
  requestParamsValidationHandler(UpdateCartRequestParamSchema),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.params as unknown as z.infer<
        typeof UpdateCartRequestParamSchema
      >;

      const product = await ProductModel.findById(productId);
      if (!product) {
        res.success = false;
        res.message = "Product not found";
        next();
        return;
      }

      console.log(req.user._id, product._id);

      await CartProductModel.findOneAndUpdate(
        {
          user: req.user._id,
          product: product._id,
        },
        {
          quantity,
        }
      );

      next();
    } catch (error) {
      next(error);
    }
  }
);

CartRouter.delete(
  "/:productId",
  authHandler,
  roleHandler(["user"]),
  requestParamsValidationHandler(DeleteCartProductRequestParamSchema),
  async (req, res, next) => {
    try {
      const { productId } = req.params as unknown as z.infer<
        typeof DeleteCartProductRequestParamSchema
      >;

      const product = await ProductModel.findById(productId);
      if (!product) {
        res.success = false;
        res.message = "Product not found";
        next();
        return;
      }

      const cartProduct = await CartProductModel.findOne({
        user: req.user._id,
        product: product._id,
      });

      if (!cartProduct) {
        res.success = false;
      } else {
        await cartProduct.deleteOne();
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

export default CartRouter;

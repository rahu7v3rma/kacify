import { Router } from "express";
import { z } from "zod";
import { authHandler, roleHandler } from "../middlewares/auth";
import {
  requestBodyValidationHandler,
  requestParamsValidationHandler,
} from "../middlewares/validation";
import { CartProductModel } from "../models/cart";
import ProductModel from "../models/product";
import { GetCartResponseDataSchema } from "../utils/serializers";
import { UserType } from "../utils/types";
import {
  AddToCartRequestBodySchema,
  DeleteCartProductRequestParamSchema,
  UpdateCartRequestParamSchema,
} from "../utils/zod";
import { errorCatcher } from "../middlewares/error";
import OrderModel from "../models/order";
import { UserModelName } from "../models/user";

const CartRouter = Router();

CartRouter.post(
  "/",
  authHandler,
  roleHandler(["user"]),
  requestBodyValidationHandler(AddToCartRequestBodySchema),
  errorCatcher(async (req, res, next) => {
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

    res.json({
      success: true,
      message: "added to cart",
      data: null,
    });

    return;
  })
);

CartRouter.get(
  "/products",
  authHandler,
  roleHandler(["user"]),
  errorCatcher(async (req, res, next) => {
    res.defaultData = [];

    const cartProducts = await CartProductModel.find({
      user: req.user._id,
    }).populate("product");

    res.data = GetCartResponseDataSchema.parse(cartProducts);

    next();
  })
);

CartRouter.put(
  "/:productId/:quantity",
  authHandler,
  roleHandler(["user"]),
  requestParamsValidationHandler(UpdateCartRequestParamSchema),
  errorCatcher(async (req, res, next) => {
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
  })
);

CartRouter.delete(
  "/:productId",
  authHandler,
  roleHandler(["user"]),
  requestParamsValidationHandler(DeleteCartProductRequestParamSchema),
  errorCatcher(async (req, res, next) => {
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
  })
);

export default CartRouter;

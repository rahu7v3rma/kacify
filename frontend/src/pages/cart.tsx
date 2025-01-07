import { useEffect, useState } from "react";
import {
  editCartProduct,
  fetchCartProducts,
  removeFromCart,
} from "../utils/api";
import { CartProductType } from "../utils/types";

const Cart = () => {
  const [cartProducts, setCartProducts] = useState<CartProductType[]>([]);
  const loadCart = () => {
    fetchCartProducts().then(setCartProducts);
  };
  useEffect(() => {
    loadCart();
  }, []);
  return (
    <div className="p-4">
      Cart
      {cartProducts?.map((cartItem, index) => (
        <div key={index} className="border w-max p-2 mt-2 flex gap-2">
          <span>{cartItem.product.name}</span>
          {cartItem.quantity > 1 && (
            <span
              className="cursor-pointer"
              onClick={() => {
                editCartProduct(
                  cartItem.product._id,
                  cartItem.quantity - 1
                ).then((response) => {
                  if (response.success) {
                    loadCart();
                  } else {
                    alert(response.message);
                  }
                });
              }}
            >
              -
            </span>
          )}
          <span>{cartItem.quantity}</span>
          <span
            className="cursor-pointer"
            onClick={() => {
              editCartProduct(cartItem.product._id, cartItem.quantity + 1).then(
                (response) => {
                  if (response.success) {
                    loadCart();
                  } else {
                    alert(response.message);
                  }
                }
              );
            }}
          >
            +
          </span>
          <span
            className="cursor-pointer"
            onClick={() => {
              removeFromCart(cartItem.product._id).then((response) => {
                if (response.success) {
                  loadCart();
                } else {
                  alert(response.message);
                }
              });
            }}
          >
            X
          </span>
        </div>
      ))}
    </div>
  );
};

export default Cart;

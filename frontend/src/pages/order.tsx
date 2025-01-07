import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { GetOrderResponseDataSchema } from "../../../api/src/utils/serializers";
import { getOrder, logError, postOrder } from "../utils/api";

const stripePromise = loadStripe(
  "pk_test_51PnPkGRs9UmlsGpef456k4Uow7yIk6dTtFfA4yzinm9S3Vk8ZK53TydbYh39qol7Yr7mmf7yjYDL1PRQtzhGvMMB00XtXiWYE2"
);

const PaymentForm = ({
  clientSecret,
  address,
  email,
}: {
  clientSecret: string;
  address: string;
  email: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!address || !email) {
      alert("Please enter address and email");
      return;
    }

    try {
      await elements.submit();

      const result = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url:
            process.env.REACT_APP_API_BASE_URL + "/user/checkout/confirm",
        },
        redirect: "if_required",
      });

      if (result.error) {
        logError(JSON.stringify(result.error));
        alert("An error occurred. Please try again.");
        return;
      }

      if (result.paymentIntent?.status !== "succeeded") {
        logError(JSON.stringify(result.paymentIntent));
        alert("An error occurred. Please try again.");
      }

      await postOrder(result.paymentIntent.id, address, email)
    } catch (error) {
      logError(JSON.stringify(error));
      alert("An error occurred. Please try again.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <input type="submit" className="border w-max m-4 cursor-pointer" />
    </form>
  );
};

const Order = () => {
  const [order, setOrder] =
    useState<z.infer<typeof GetOrderResponseDataSchema>>();
  const loadCheckout = () => {
    getOrder().then(setOrder);
  };
  useEffect(() => {
    loadCheckout();
  }, []);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const stripeBuyButtonNode = document.createElement("stripe-buy-button");
    stripeBuyButtonNode.setAttribute(
      "buy-button-id",
      "buy_btn_1PnPncRs9UmlsGpeq91TaHK9"
    );
    stripeBuyButtonNode.setAttribute(
      "publishable-key",
      "pk_test_51PnPkGRs9UmlsGpef456k4Uow7yIk6dTtFfA4yzinm9S3Vk8ZK53TydbYh39qol7Yr7mmf7yjYDL1PRQtzhGvMMB00XtXiWYE2"
    );
    document.getElementById("mainForm")?.appendChild(stripeBuyButtonNode);
  });
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1>Checkout</h1>
      {order && (
        <div className="flex flex-col gap-4" id="mainForm">
          <table className="w-max">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.cart?.map((cartItem, index) => (
                <tr key={index}>
                  <td>{cartItem.product.name}</td>
                  <td>{cartItem.quantity}</td>
                  <td>{cartItem.product.price * cartItem.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <span>
            Total:{" "}
            {order.cart.reduce(
              (acc, cartItem) =>
                acc + cartItem.product.price * cartItem.quantity,
              0
            )}
          </span>
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border w-max"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-max"
          />
          {order.clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: order.clientSecret,
              }}
            >
              <PaymentForm
                clientSecret={order.clientSecret}
                address={address}
                email={email}
              />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
};

export default Order;

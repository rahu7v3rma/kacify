import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useEffect, useState } from "react";
import { ProductType } from "../../../api/src/utils/types";
import { getCheckout, logError, postCheckout } from "../utils/api";

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

      postCheckout(result.paymentIntent.id, address, email).then((response) => {
        if (!response.success) {
          alert(response.message);
          return;
        }

        alert("Payment successful");
      });
    } catch (error) {
      logError(JSON.stringify(error));
      alert("An error occurred. Please try again.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <input type="submit" className="border w-max m-4" />
    </form>
  );
};

const Checkout = () => {
  const [cart, setCart] = useState<
    {
      product: ProductType;
      quantity: number;
    }[]
  >([]);
  const [clientSecret, setClientSecret] = useState("");
  const loadCheckout = () => {
    getCheckout().then((response) => {
      if (response.success) {
        setCart(
          response.data.cart.map((x) => ({
            product: x.product as ProductType,
            quantity: x.quantity,
          }))
        );
        setClientSecret(response.data.clientSecret);
      } else {
        alert(response.message);
      }
    });
  };
  useEffect(() => {
    loadCheckout();
  }, []);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1>Checkout</h1>
      <table className="w-max">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {cart?.map((cartItem, index) => (
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
        {cart.reduce(
          (acc, cartItem) => acc + cartItem.product.price * cartItem.quantity,
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
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
          }}
        >
          <PaymentForm
            clientSecret={clientSecret}
            address={address}
            email={email}
          />
        </Elements>
      )}
    </div>
  );
};

export default Checkout;

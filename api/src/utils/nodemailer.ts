import { createTransport } from "nodemailer";
import { ProductType } from "./types";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = createTransport({
    host: String(process.env.EMAIL_HOST),
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: String(process.env.EMAIL_ADDRESS),
      pass: String(process.env.EMAIL_PASSWORD),
    },
  });
  await transporter.sendMail({
    from: String(process.env.EMAIL_ADDRESS),
    to,
    subject,
    text,
  });
};

export const sendErrorEmail = async (error: string) => {
  await sendEmail(process.env.EMAIL_ADDRESS!, "Kacify API error", error);
};

export const sendForgotPasswordEmail = async (to: string, token: number) => {
  await sendEmail(
    to,
    "Kacify change password link",
    `${process.env.FRONTEND_URL}/changePassword?token=${to}|${token}`
  );
};

export const sendProductsEmail = async (
  to: string,
  products: ProductType[]
) => {
  await sendEmail(to, "Your products", products.map((p) => p.name).join(", "));
};

export const sendOrderEmail = async (to: string, orderInfo: string) => {
  await sendEmail(
    to,
    "Kacify order confirmation",
    `Your order has been confirmed: ${orderInfo}`
  );
};

import { sendErrorEmail } from "./nodemailer";

export const handleError = (message: string) => {
  console.error(new Date().toISOString(), message);
  sendErrorEmail(message);
};

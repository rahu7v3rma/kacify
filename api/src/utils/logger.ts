import { sendErrorEmail } from "./nodemailer";

export const handleError = (error: any) => {
  console.error(new Date().toISOString(), error);
  sendErrorEmail(JSON.stringify(error));
};

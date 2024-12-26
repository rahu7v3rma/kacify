import { UserType } from "./types";

declare global {
  namespace Express {
    interface Request {
      user: UserType;
    }
    interface Response {
      success: boolean;
      message: string;
      data: any;
    }
  }
}

export {};

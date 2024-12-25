import axios from "axios";
import { getAuthToken } from "./localStorage";
import { ProductType, UserType } from "../../../api/src/utils/types";

const request = async <DataType>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data: any = {}
): Promise<{
  success: boolean;
  data: DataType;
  message: string;
}> => {
  const response = await axios.request({
    method,
    baseURL: process.env.REACT_APP_API_BASE_URL,
    url,
    headers: {
      Authorization: getAuthToken(),
    },
    data,
  });
  return response.data;
};

export const fetchVendorProducts = async () => {
  return await request<ProductType[]>("GET", "/product/vendor");
};

export const fetchAllProducts = async () => {
  return await request<ProductType[]>("GET", "/product/list");
};

export const registerUser = async (
  email: string,
  password: string,
  role: string
) => {
  return await request("POST", "/user/register", {
    email,
    password,
    role,
  });
};

export const loginUser = async (
  email: string,
  password: string,
  role: string
) => {
  return await request<string>("POST", "/user/login", {
    email,
    password,
    role,
  });
};

export const getUserProfile = async () => {
  return await request<UserType>("GET", "/user/profile");
};

export const forgotPassword = async (email: string) => {
  return await request("POST", "/user/forgotPassword", {
    email,
  });
};

export const getUsers = async () => {
  return await request<UserType[]>("GET", "/user/all");
};

export const deleteUser = async (userId: string) => {
  return await request("DELETE", `/user/${userId}`);
};

export const changePassword = async (password: string, token: string) => {
  return await request("POST", "/user/changePassword", {
    password,
    token,
  });
};

export const addProduct = async (
  name: string,
  price: number,
  image: string,
  description: string
) => {
  return await request("POST", "/product/", {
    name,
    price,
    image,
    description,
  });
};

export const deleteProduct = async (productId: string) => {
  return await request("DELETE", `/product/${productId}`);
};

export const editProduct = async (
  productId: string,
  name: string,
  price: number,
  image: string,
  description: string
) => {
  return await request("PUT", `/product/${productId}`, {
    name,
    price,
    image,
    description,
  });
};

export const addToCart = async (productId: string, quantity: number) => {
  return await request("POST", `/user/cart`, {
    productId,
    quantity,
  });
};

export const fetchCart = async () => {
  return await request<UserType["cart"]>("GET", `/user/cart`);
};

export const addUser = async (
  email: string,
  role: string,
  password: string
) => {
  return await request("POST", `/user/`, {
    email,
    role,
    password,
  });
};

export const removeFromCart = async (productId: string) => {
  return await request("DELETE", `/user/cart/${productId}`);
};

export const editCartProduct = async (productId: string, quantity: number) => {
  return await request("PUT", `/user/cart/${productId}/${quantity}`);
};

export const getCheckout = async () => {
  return await request<{
    cart: UserType["cart"];
    clientSecret: string;
  }>("GET", `/user/checkout`);
};

export const logError = async (error: string) => {
  return await request("POST", `/log/error`, {
    error,
  });
};

export const postCheckout = async (
  paymentIntentId: string,
  address: string,
  email: string
) => {
  return await request("POST", `/user/checkout`, {
    paymentIntentId,
    address,
    email,
  });
};

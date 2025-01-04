import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./global.css";
import AllProducts from "./pages/allProducts";
import ChangePassword from "./pages/changePassword";
import ForgotPassword from "./pages/forgotPassword";
import Home from "./pages/home";
import Login from "./pages/login";
import Logout from "./pages/logout";
import Profile from "./pages/profile";
import Register from "./pages/register";
import Users from "./pages/users";
import VendorProducts from "./pages/vendorProducts";
import Cart from "./pages/cart";
import Order from "./pages/order";

const root = createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/vendor" element={<VendorProducts />} />
      <Route path="/user/register" element={<Register role="user" />} />
      <Route path="/login" element={<Login role="user" />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<Login role="admin" />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/changePassword" element={<ChangePassword />} />
      <Route path="/vendor/login" element={<Login role="vendor" />} />
      <Route path="/vendor/register" element={<Register role="vendor" />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order" element={<Order />} />
    </Routes>
  </BrowserRouter>
);

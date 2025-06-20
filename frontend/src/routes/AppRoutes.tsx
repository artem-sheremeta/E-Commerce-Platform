import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import UsersPage from "../pages/UsersPage";
import CreateProductPage from "../pages/CreateProductPage";
import Layout from "../components/Layout";
import MyProductsPage from "../pages/MyProductPage";
import UserDetailsPage from "../pages/UserDetailsPage";
import EditProductPage from "../pages/UpdateProductPage";
import ProfilePage from "../pages/ProfilePage";
import OrderPage from "../pages/OrderPage";
import SearchPage from "../components/SearchPage";
import InboxPage from "../pages/InboxPage";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />{" "}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/create-product" element={<CreateProductPage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />
          <Route path="/edit-product/:id" element={<EditProductPage />} />
          <Route path="/personal-information" element={<ProfilePage />} />
          <Route path="/checkout" element={<OrderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/inbox" element={<InboxPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;

import React from "react";
import "./styles/HomePage.css";
import ProductList from "../components/ProductList";

const HomePage: React.FC = () => {
  return (
    <div>
      <main className="homepage">
        <ProductList />
      </main>
    </div>
  );
};

export default HomePage;

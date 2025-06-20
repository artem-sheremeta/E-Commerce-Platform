import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/ProductList.css";
import { categories } from "./CategoriesMenu";

interface Seller {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  imageUrl: string;
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: number;
  seller: Seller;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/products");
        setProducts(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Помилка завантаження продуктів."
        );
      }
    };

    fetchProducts();
  }, []);

  const defaultImage = "https://via.placeholder.com/150?text=Product+Image";

  const handleCardClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Будь ласка, увійдіть або зареєструйтеся, щоб додати товари в корзину."
      );
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/cart",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Товар додано до корзини!");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Не вдалося додати товар до корзини."
      );
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <div className="product-page">
      <aside className="sidebar">
        <div
          className={`sidebar-item ${
            selectedCategory === null ? "active" : ""
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          Всі категорії
        </div>
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`sidebar-item ${
              selectedCategory === cat.name ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <span className="icon">{cat.icon}</span> {cat.name}
          </div>
        ))}
      </aside>

      <main className="product-content">
        <h2>Список товарів</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleCardClick(product.id)}
              >
                <div className="image-wrapper">
                  <img
                    src={`http://localhost:3000${
                      product.imageUrl || defaultImage
                    }`}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">{product.price} ₴</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product.id);
                  }}
                  className="inCart-button"
                >
                  В корзину
                </button>
              </div>
            ))
          ) : (
            <p>Товарів у цій категорії не знайдено.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductList;

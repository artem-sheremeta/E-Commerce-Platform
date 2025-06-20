import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/ProductDetailsPage.css";
import { ChatWidget } from "../components/ChatWidget";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: number;
  imageUrl: string;
  seller: {
    username: string;
    email: string;
    id: number;
  };
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/products/${id}`
        );
        setProduct(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Помилка завантаження даних товару."
        );
      }
    };

    fetchProduct();
  }, [id]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!product) {
    return <p>Завантаження інформації про товар...</p>;
  }

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

  const defaultImage = "https://via.placeholder.com/400x400?text=Product+Image";
  const currentUserId = Number(localStorage.getItem("userId"));

  const sellerId = product.seller.id;
  const otherUserId = sellerId;

  return (
    <div className="product-details">
      <div className="product-image-container">
        <img
          src={`http://localhost:3000${product.imageUrl || defaultImage}`}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="product-category">Категорія: {product.category}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-price">
          <strong>Ціна:</strong> ${product.price}
        </p>
        <p className="product-quantity">
          <strong>В наявності:</strong> {product.quantity} шт.
        </p>

        <button
          className="buy-now-button"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product.id);
          }}
        >
          Купити зараз
        </button>

        <div className="seller-info">
          <p>
            <strong>Продавець:</strong> {product.seller.username}
          </p>
          <p>
            <strong>Email:</strong> {product.seller.email}
          </p>
        </div>

        {currentUserId !== sellerId && (
          <button className="chat-button" onClick={() => setShowChat(true)}>
            Зв’язатися з продавцем
          </button>
        )}
      </div>
      {showChat && currentUserId !== otherUserId && (
        <ChatWidget
          currentUserId={currentUserId}
          sellerId={sellerId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;

import React, { useEffect, useState } from "react";
import "./styles/SearchPage.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

const SearchPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/products/search?query=${encodeURIComponent(
            searchQuery
          )}`
        );
        setProducts(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
        setError("Не вдалося завантажити результати пошуку.");
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const defaultImage = "https://via.placeholder.com/150?text=Product+Image";

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

  const handleCardClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="search-results">
      <h1>Search Results for "{searchQuery}"</h1>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleCardClick(product.id)}
            >
              <img
                src={`http://localhost:3000${product.imageUrl || defaultImage}`}
                alt="Product"
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p>
                <strong>Ціна:</strong> ${product.price}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product.id);
                }}
                className="cart-button"
              >
                В корзину
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

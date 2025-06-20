import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/CartModal.css";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    seller: {
      username: string;
    };
  };
}

interface CartModalProps {
  onClose: () => void;
  isAuthenticated: boolean;
}

const CartModal: React.FC<CartModalProps> = ({ onClose, isAuthenticated }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCartItems = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCartItems(response.data);
        } catch (err: any) {
          setError(
            err.response?.data?.message || "Не вдалося завантажити корзину."
          );
        }
      };

      fetchCartItems();
    }
  }, [isAuthenticated]);

  const handleRemoveItem = async (id: string) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/cart/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems(cartItems.filter((item) => item.id !== id));
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Помилка при видаленні товару."
        );
      }
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `http://localhost:3000/cart/${id}/update-quantity`,
          { quantity: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Помилка при оновленні кількості."
        );
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

  const handleCheckout = () => {
    if (isAuthenticated) {
      onClose();
      navigate("/checkout");
    } else {
      setError("Увійдіть в систему для оформлення замовлення.");
    }
  };

  return (
    <div className="cart-modal" onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Кошик</h2>
          <button className="cart-modal-close" onClick={onClose}>
            ✖
          </button>
        </div>
        {error && <div className="error-message">{error}</div>},
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="empty-cart">
              {isAuthenticated ? "Корзина порожня" : "Корзина порожня."}
            </p>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={
                      item.product.imageUrl
                        ? `http://localhost:3000${item.product.imageUrl}`
                        : "https://via.placeholder.com/100x100?text=No+Image"
                    }
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.product.name}</p>
                    <p className="cart-item-description">
                      {item.product.description}
                    </p>
                    <p className="cart-item-seller">
                      Продавець: {item.product.seller.username}
                    </p>
                    <p className="cart-item-price">
                      {item.product.price} ₴ x {item.quantity}
                    </p>
                    <div className="cart-item-quantity">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-item-button"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="cart-footer">
          <div className="total-price">
            Загальна сума: <span>{getTotalPrice()} ₴</span>
          </div>
          {isAuthenticated ? (
            <button className="checkout-button" onClick={handleCheckout}>
              Оформити замовлення
            </button>
          ) : (
            <p className="login-prompt">Увійдіть, щоб оформити замовлення</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;

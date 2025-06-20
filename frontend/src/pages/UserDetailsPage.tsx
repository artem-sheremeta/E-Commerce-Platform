import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/UserDetailsPage.css";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
}

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get(
          `http://localhost:3000/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(userResponse.data);

        if (userResponse.data.role === "seller") {
          const productsResponse = await axios.get(
            `http://localhost:3000/products/seller/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setProducts(productsResponse.data);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user details");
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleBlockUnblock = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = user.isBanned
        ? `http://localhost:3000/admin/unblock/${user.id}`
        : `http://localhost:3000/admin/block/${user.id}`;

      await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser({ ...user, isBanned: !user.isBanned });
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3000/products/delete/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(products.filter((product) => product.id !== productId));
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div>Loading user details...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div className="user-details">
      <h1>User Details</h1>
      {user && (
        <div>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>isBanned:</strong> {user.isBanned ? "Yes" : "No"}
          </p>
          <button
            onClick={handleBlockUnblock}
            disabled={actionLoading}
            className={`ban-button ${user.isBanned ? "unban" : "ban"}`}
          >
            {actionLoading
              ? "Processing..."
              : user.isBanned
              ? "Unblock User"
              : "Block User"}
          </button>
        </div>
      )}
      {user?.role === "seller" && (
        <div className="seller-products">
          <h2>Seller's Products</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id} className="product-item">
                <p>
                  <strong>ID:</strong> {product.id}
                </p>
                <p>
                  <strong>Name:</strong> {product.name}
                </p>
                <p>
                  <strong>Description:</strong> {product.description}
                </p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>
                <p>
                  <strong>Price:</strong> ${product.price}
                </p>
                <p>
                  <strong>Quantity:</strong> {product.quantity}
                </p>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/EditProductPage.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
}

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Partial<Product>>({});
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProduct(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch product");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", product.name || "");
      formData.append("description", product.description || "");
      formData.append("price", String(product.price));
      formData.append("quantity", String(product.quantity));
      formData.append("category", product.category || "");
      if (image) {
        formData.append("image", image);
      }

      await axios.patch(`http://localhost:3000/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Product updated successfully!");
      setError("");
      setTimeout(() => navigate("/my-products"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product");
      setSuccessMessage("");
    }
  };

  if (loading) {
    return <div>Loading product...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div className="edit-product-page">
      <h1>Edit Product</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={product.name || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={product.price || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={product.quantity || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Category:
          <input
            type="text"
            name="category"
            value={product.category || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Нове зображення:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]);
              }
            }}
          />
        </label>
        {product.imageUrl && (
          <div>
            <p>Поточне зображення:</p>
            <img
              src={`http://localhost:3000${product.imageUrl}`}
              alt="Product"
              style={{ width: "150px", borderRadius: "8px" }}
            />
          </div>
        )}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProductPage;

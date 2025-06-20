import React, { useState } from "react";
import axios from "axios";
import "./styles/CreateProductPage.css";
import { categories } from "../components/CategoriesMenu";

const CreateProductPage: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(250);
  const [quantity, setQuantity] = useState(25);
  const [image, setImage] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setErrorMessage("Будь ласка, виберіть зображення");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price.toString());
      formData.append("quantity", quantity.toString());
      formData.append("image", image);

      await axios.post("http://localhost:3000/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Product created successfully!");
      setErrorMessage("");
      setName("");
      setDescription("");
      setCategory("");
      setPrice(1);
      setQuantity(1);
      setImage(null);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to create product"
      );
      setSuccessMessage("");
    }
  };

  return (
    <div className="create-product">
      <h1>Create New Product</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Оберіть категорію</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }}
          required
        />
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default CreateProductPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/ProfilePage.css";

interface UserData {
  username: string;
  email: string;
  password?: string;
}

interface OrderItem {
  productName: string;
  productId: number;
  price: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  payment_status: string;
  createAt: string;
  items: OrderItem[];
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
  });
  const [initialUserData, setInitialUserData] = useState<UserData>({
    username: "",
    email: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("userId");
        const [userResponse, orderResponse] = await Promise.all([
          axios.get(`http://localhost:3000/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`http://localhost:3000/orders/user/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setUserData(userResponse.data);
        setInitialUserData(userResponse.data);
        setOrders(orderResponse.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Не вдалося завантажити дані користувача."
        );
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("userId");

      const updatedFields: Partial<UserData> = {};
      for (const key in userData) {
        if (
          userData[key as keyof UserData] !==
          initialUserData[key as keyof UserData]
        ) {
          updatedFields[key as keyof UserData] =
            userData[key as keyof UserData];
        }
      }

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          alert("Паролі не співпадають!");
          return;
        }
        updatedFields["password"] = newPassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        alert("Дані не було змінено.");
        setIsEditing(false);
        return;
      }

      await axios.patch(
        `http://localhost:3000/users/${id}`,
        updatedFields, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInitialUserData((prev) => ({ ...prev, ...updatedFields }));
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");

      alert("Дані оновлено успішно!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Не вдалося оновити дані.");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Ваш профіль</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="profile-details">
          <div className="profile-field">
            <label>Ім'я:</label>
            <input
              type="text"
              name="username"
              value={userData?.username}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData?.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          {isEditing && (
            <>
              <div className="profile-field">
                <label>Новий пароль:</label>
                <input
                  type="password"
                  name="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="profile-field">
                <label>Підтвердьте новий пароль:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </>
          )}

          {isEditing ? (
            <button className="save-button" onClick={handleSave}>
              Зберегти
            </button>
          ) : (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Редагувати
            </button>
          )}
        </div>

        <div className="order-history">
          <h2>Моя історія замовлень</h2>
          {orders.length === 0 ? (
            <p>У вас немає замовлень.</p>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.id} className="order-item">
                  <p>
                    <strong>Статус:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Оплата:</strong> {order.payment_status}
                  </p>
                  <p>
                    <strong>Дата:</strong>{" "}
                    {new Date(order.createAt).toLocaleString()}
                  </p>

                  {order.items.map((item, index) => (
                    <div key={index} className="order-item-details">
                      <p>
                        <strong>Продукт:</strong> {item.productName}
                      </p>
                      <p>
                        <strong>Ціна:</strong> {item.price} ₴
                      </p>
                      <p>
                        <strong>Сума:</strong>{" "}
                        {order.items.reduce(
                          (sum, item) =>
                            sum + Number(item.price) * item.quantity,
                          0
                        )}{" "}
                        ₴
                      </p>
                      <p>
                        <strong>Кількість:</strong> {item.quantity}
                      </p>
                      <hr />
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./styles/Layout.css";
import { ChatWidget } from "./ChatWidget";
import axios from "axios";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const token = localStorage.getItem("token");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId"));
    if (userId) setCurrentUserId(userId);

    axios
      .get("http://localhost:3000/users/role/admin", { headers })
      .then((res) => {
        setAdminId(res.data.id);
      });
  }, []);

  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>

      {currentUserId && adminId && !showChat && (
        <button className="chat-fab" onClick={() => setShowChat(true)}>
          💬
        </button>
      )}

      {currentUserId && adminId && showChat && (
        <ChatWidget
          currentUserId={currentUserId}
          sellerId={adminId}
          onClose={() => setShowChat(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Layout;

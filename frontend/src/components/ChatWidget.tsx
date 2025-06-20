import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import "./styles/ChatWidget.css";

interface ChatWidgetProps {
  currentUserId: number;
  sellerId: number;
  conversationId?: number | null;
  onClose: () => void;
}

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  sentAt: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  currentUserId,
  sellerId,
  conversationId: propConversationId,
  onClose,
}) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(
    propConversationId ?? null
  );
  const [newMessage, setNewMessage] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      if (currentUserId === sellerId) {
        console.warn("Неможливо почати чат із самим собою.");
        return;
      }
      setUserId(currentUserId);

      const init = async () => {
        try {
          const res = await axios.post(
            "http://localhost:3000/chat/conversations/start",
            { senderId: currentUserId, receiverId: sellerId },
            { headers }
          );
          const id = res.data.id;
          setConversationId(id);

          const messagesRes = await axios.get(
            `http://localhost:3000/chat/messages/${id}`,
            { headers }
          );

          const sortedMessages = messagesRes.data.sort(
            (a: Message, b: Message) =>
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
          setMessages(sortedMessages);

          socket.connect();
          socket.emit("joinConversation", { conversationId: id });

          socket.off("message");
          socket.on("message", (msg: Message) => {
            setMessages((prev) =>
              [...prev, msg].sort(
                (a, b) =>
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
              )
            );
          });
        } catch (error) {
          console.error("Помилка ініціалізації чату:", error);
        }
      };

      init();
    }
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId || !userId) return;

    socket.emit("sendMessage", {
      conversationId,
      senderId: userId,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-logo">💬</div>
          <div className="chat-title">Support</div>
        </div>
        <button className="chat-close" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="chat-greeting">
        Доброго дня! Будь ласка, напишіть ваше питання та ми залюбки вам
        допоможемо 💚
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.sender.id === userId ? "sent" : "received"
            }`}
          >
            <span className="chat-username">{msg.sender.username}</span>:{" "}
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input-wrapper">
        <input
          className="input-text"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Напишіть свій коментар"
        />
        <button className="chat-send-btn" onClick={handleSendMessage}>
          ➤
        </button>
      </div>

      <div className="chat-footer">Powered by YourCompany</div>
    </div>
  );
};

import { useEffect, useState } from "react";
import axios from "axios";
import { ChatWidget } from "../components/ChatWidget";
import "./styles/InboxPage.css";

interface Conversation {
  id: number;
  otherUser: { id: number; username: string };
  lastMessage: string;
  lastDate: string;
}

const InboxPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const currentUserId = Number(localStorage.getItem("userId"));

  const deduplicateConversations = (convs: Conversation[]) => {
    const map = new Map();
    convs.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, c);
      }
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/chat/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const unique = deduplicateConversations(res.data);
        setConversations(unique);
      });
  }, []);

  return (
    <div className="inbox-container">
      <h2>Вхідні повідомлення</h2>
      <div className="conversation-list">
        {conversations.map((conv) => (
          <div key={conv.id} className="conversation-card">
            {conv.otherUser ? (
              <>
                <div className="conversation-avatar">
                  {conv.otherUser.username[0]?.toUpperCase()}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <span className="username">{conv.otherUser.username}</span>
                    <span className="date">
                      {new Date(conv.lastDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="conversation-message">{conv.lastMessage}</div>
                </div>
                <button
                  className="open-chat-btn"
                  onClick={() => setActiveChat(conv)}
                >
                  💬
                </button>
              </>
            ) : (
              <p>Невідомий користувач</p>
            )}
          </div>
        ))}
      </div>

      {activeChat && (
        <ChatWidget
          currentUserId={currentUserId}
          sellerId={activeChat.otherUser.id}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default InboxPage;

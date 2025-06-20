import { useState, useEffect } from "react";
import axios from "axios";
import { ChatWidget } from "./ChatWidget";

const GlobalChatButton = ({ currentUserId }: { currentUserId: number }) => {
  const [adminId, setAdminId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("/users/role/admin").then((res) => setAdminId(res.data.id));
  }, []);

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(true)}>
        💬
      </button>
      {open && adminId && (
        <ChatWidget
          currentUserId={currentUserId}
          sellerId={adminId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default GlobalChatButton;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthProvider";
import { MessageCircle, Clock } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserChats = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const res = await fetch(`${API_URL}/api/messages/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6 text-[#FDFBF7]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-[#D2B48C]/70 mt-2">Your conversations</p>
      </header>

      {loading ? (
        <div className="text-[#D2B48C]">Loading your messages...</div>
      ) : (
        <div className="space-y-3">
          {chats.length === 0 ? (
            <div className="text-center py-16 bg-[#2C1A11]/50 rounded-xl border border-dashed border-[#8B4513]/50">
              <MessageCircle className="w-16 h-16 text-[#8B4513] mx-auto mb-4" />
              <p className="text-[#D2B48C] text-lg mb-2">No conversations yet</p>
              <p className="text-[#D2B48C]/60 text-sm">
                Start chatting with book owners from the Dashboard
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`, {
                  state: {
                    ownerName: chat.otherUser.username,
                    ownerId: chat.otherUser.id
                  }
                })}
                className="bg-[#2C1A11]/50 border border-[#8B4513]/30 rounded-xl p-4 hover:border-[#D2B48C]/50 transition-all duration-300 cursor-pointer group shadow-md hover:shadow-[#D2B48C]/5"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {chat.otherUser.image_url ? (
                      <img
                        src={chat.otherUser.image_url}
                        alt={chat.otherUser.username}
                        className="w-12 h-12 rounded-full object-cover border border-[#8B4513]/50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center text-[#FDFBF7] text-lg font-semibold border border-[#D2B48C]/30">
                        {chat.otherUser.username?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[#FDFBF7] font-semibold group-hover:text-[#D2B48C] transition-colors">
                        {chat.otherUser.username}
                      </h3>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-[#D2B48C]/50 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-[#D2B48C]/70 text-sm truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-[#D2B48C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;

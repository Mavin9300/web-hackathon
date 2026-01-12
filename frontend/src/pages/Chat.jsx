import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthProvider";
import { contentModerator } from "../services/contentModerator";

const Chat = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get chat info from location state (book and owner info)
  useEffect(() => {
    if (location.state) {
      setChatInfo(location.state);
    }
  }, [location.state]);

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        const res = await fetch(`${API_URL}/api/messages/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          // If chatInfo is not set and we have messages, get other user's info from messages
          if (!chatInfo && data.length > 0) {
            const otherUserMessage = data.find(msg => msg.sender_id !== user.id);
            if (otherUserMessage && otherUserMessage.sender) {
              setChatInfo({
                ownerName: otherUserMessage.sender.username,
                ownerId: otherUserMessage.sender_id
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId, chatInfo, user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      // Step 1: Check content with Gemini AI
      console.log("Checking message for abusive language...");
      const moderationResult = await contentModerator.checkContent(newMessage, user.id);

      console.log("Moderation result:", moderationResult);

      if (moderationResult.isFlagged) {
        console.log("Message flagged as abusive");

        // Deduct reputation points
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token) {
          console.log("Deducting reputation for user:", user.id);
          const reputationRes = await fetch(`${API_URL}/api/profiles/${user.id}/deduct-reputation`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: 5,
              reason: "Abusive content in chat message",
            }),
          });

          if (reputationRes.ok) {
            const result = await reputationRes.json();
            console.log("Reputation deducted successfully:", result);
          } else {
            const error = await reputationRes.json();
            console.error("Failed to deduct reputation:", error);
          }
        }

        // Show warning popup
        setWarningMessage(
          "⚠️ Your message contains inappropriate content and has been blocked. Your reputation has been reduced by 5 points."
        );
        setShowWarning(true);
        setSending(false);
        setNewMessage("");
        return;
      }

      // Step 2: If content is clean, proceed with sending
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chat_id: chatId,
          sender_id: user.id,
          content: newMessage,
          ai_flagged: false,
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0f0a] flex items-center justify-center">
        <div className="text-[#D2B48C] text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f0a] flex flex-col">
      {/* Warning Popup Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#2C1A11] border-2 border-red-500 rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-400">Message Blocked</h3>
            </div>
            <p className="text-[#D2B48C]/80 mb-6">{warningMessage}</p>
            <button
              onClick={() => {
                setShowWarning(false);
                setNewMessage("");
              }}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#8B4513]/30 bg-[#2C1A11]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[#D2B48C] hover:text-[#C19A6B] transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#FDFBF7]">
                {chatInfo?.ownerName || "Chat"}
              </h1>
              {chatInfo?.bookTitle && (
                <p className="text-sm text-[#D2B48C]/70">
                  About: {chatInfo.bookTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[#D2B48C]/50 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {msg.sender?.image_url ? (
                        <img
                          src={msg.sender.image_url}
                          alt={msg.sender.username}
                          className="w-8 h-8 rounded-full object-cover border border-[#8B4513]/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center text-[#FDFBF7] text-sm font-semibold border border-[#D2B48C]/30">
                          {msg.sender?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                    {!isOwn && (
                      <span className="text-xs text-[#D2B48C]/70 mb-1 px-3">
                        {msg.sender?.username || "Unknown"}
                      </span>
                    )}
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${isOwn
                          ? "bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-[#2C1A11] font-medium"
                          : "bg-[#3E2723] text-[#FDFBF7] border border-[#8B4513]/30"
                        }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-xs text-[#D2B48C]/50 mt-1 px-3">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#8B4513]/30 bg-[#2C1A11]/90 backdrop-blur-md sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#3E2723]/50 border border-[#8B4513]/50 rounded-full px-5 py-3 text-[#FDFBF7] placeholder-[#D2B48C]/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#D2B48C] text-[#2C1A11] rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-[#D2B48C]/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

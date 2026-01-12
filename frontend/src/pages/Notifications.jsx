import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { ArrowLeft, Bell, BookOpen, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch(`${API_URL}/api/notifications/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    try {
      if (!notification.is_read) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        await fetch(`${API_URL}/api/notifications/${notification.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local state to show read immediately
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark read:", error);
    }

    // Open Modal instead of navigating
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="text-[#8B4513]" />
          </button>
          <h1 className="text-3xl font-bold text-[#2C1A11] flex items-center gap-2">
            <Bell /> Notifications
          </h1>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-[#E6DCC3]">
            <p className="text-gray-500 text-lg">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl cursor-pointer transition-all border
                                    ${
                                      notif.is_read
                                        ? "bg-[#F9F7F2] border-transparent opacity-75"
                                        : "bg-white shadow-md border-[#E6DCC3] hover:shadow-lg hover:scale-[1.01]"
                                    }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`mt-1 p-2 rounded-full h-fit flex-shrink-0 
                                        ${
                                          notif.is_read
                                            ? "bg-gray-200 text-gray-500"
                                            : "bg-blue-100 text-blue-600"
                                        }`}
                  >
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p
                      className={`text-[#2C1A11] ${
                        !notif.is_read && "font-semibold"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      {new Date(notif.created_at).toLocaleString()}
                      {notif.is_read && (
                        <CheckCircle
                          size={12}
                          className="text-green-500 ml-2"
                        />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Bell size={24} />
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-[#2C1A11] mb-2">
              Notification Details
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {selectedNotification.message}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
              {selectedNotification.action_link && (
                <button
                  onClick={() => {
                    navigate(selectedNotification.action_link);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-[#8B4513] hover:bg-[#2C1A11] text-white rounded-lg transition shadow-md"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

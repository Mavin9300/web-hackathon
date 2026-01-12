import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../config";
import { supabase } from "../services/supabaseClient";
import { ArrowLeft, Check, X, Clock, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "incoming";
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/requests?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Remove from list or update status locally
        fetchRequests(); // Refresh for simplicity
        alert(`Request ${status === "completed" ? "Accepted" : "Rejected"}!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update request");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="text-[#8B4513]" />
          </button>
          <h1 className="text-3xl font-bold text-[#2C1A11]">
            Requests Management
          </h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#E6DCC3]">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`pb-3 px-6 text-lg font-medium transition-colors border-b-2 ${
              activeTab === "incoming"
                ? "border-[#8B4513] text-[#8B4513]"
                : "border-transparent text-gray-500 hover:text-[#8B4513]"
            }`}
          >
            Incoming (Review)
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`pb-3 px-6 text-lg font-medium transition-colors border-b-2 ${
              activeTab === "outgoing"
                ? "border-[#8B4513] text-[#8B4513]"
                : "border-transparent text-gray-500 hover:text-[#8B4513]"
            }`}
          >
            Outgoing (My Requests)
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-[#E6DCC3]">
            <p className="text-gray-500 text-lg">
              No requests found in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-[#E6DCC3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide
                                            ${
                                              req.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : ""
                                            }
                                            ${
                                              req.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : ""
                                            }
                                            ${
                                              req.status === "cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : ""
                                            }
                                        `}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#2C1A11]">
                    {req.book?.title || "Unknown Book"}
                  </h3>

                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {activeTab === "incoming" ? (
                      <p className="flex items-center gap-2">
                        <User size={14} /> From:{" "}
                        <span className="font-semibold text-[#8B4513]">
                          {req.requester?.username || "Unknown"}
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-2">
                        <User size={14} /> To:{" "}
                        <span className="font-semibold text-[#8B4513]">
                          {req.owner?.username || "Unknown"}
                        </span>
                      </p>
                    )}
                    <p className="font-medium">
                      Offer:{" "}
                      <span className="text-green-600">
                        {req.points_used} pts
                      </span>
                      {req.points_used < (req.book?.points || 10) && (
                        <span className="text-xs text-orange-500 ml-2">
                          (Bargain Offer)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {activeTab === "incoming" && req.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req.id, "completed")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                    >
                      <Check size={18} /> Accept
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "cancelled")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;

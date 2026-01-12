import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { ArrowLeft, Trash2, BookHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch(`${API_URL}/api/wishlists/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setWishlist(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (e, bookId) => {
    e.stopPropagation();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch(`${API_URL}/api/wishlists/${user.id}/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item.book_id !== bookId));
      }
    } catch (error) {
      console.error("Failed to remove:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="text-[#8B4513]" />
          </button>
          <h1 className="text-3xl font-bold text-[#2C1A11] flex items-center gap-2">
            <BookHeart className="text-red-500" /> My Wishlist
          </h1>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-[#E6DCC3]">
            <p className="text-gray-500 text-lg">
              Your wishlist is empty. Start exploring!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-[#8B4513] font-medium hover:underline"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const book = item.book; // Assuming backend returns nested book object
              if (!book) return null;

              return (
                <div
                  key={item.book_id}
                  onClick={() => navigate(`/book/${book.id}`)} // Or open modal if logic reused
                  className="bg-white rounded-xl shadow-sm border border-[#E6DCC3] overflow-hidden hover:shadow-md transition cursor-pointer group"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={book.book_images?.[0]?.image_url || book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => removeFromWishlist(e, book.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition shadow-sm"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#2C1A11] truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#8B4513]">
                        {book.points || 10} pts
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          book.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {book.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

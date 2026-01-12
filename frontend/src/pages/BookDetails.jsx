import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { ArrowLeft, MapPin } from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // We can use the public endpoint or authenticated one.
      // Assuming /api/books/:id exists? Or we use the general list and filter?
      // Actually, BookController.getBookById exists.

      const res = await fetch(`${API_URL}/api/books/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        console.error("Failed to fetch book");
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a0f0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B48C]"></div>
      </div>
    );

  if (!book)
    return <div className="min-h-screen bg-[#1a0f0a] text-[#D2B48C] flex items-center justify-center">Book not found.</div>;

  const imageUrl =
    book.book_images && book.book_images.length > 0
      ? book.book_images[0].image_url
      : book.image_url;

  return (
    <div className="min-h-screen bg-[#1a0f0a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 p-2 bg-[#2C1A11] text-[#D2B48C] border border-[#8B4513]/30 rounded-full hover:bg-[#3E2723] hover:text-[#FDFBF7] transition shadow-lg"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="bg-[#2C1A11] border border-[#8B4513]/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-[#1A100A] flex items-center justify-center min-h-[300px] md:min-h-[400px] border-b md:border-b-0 md:border-r border-[#8B4513]/30 relative group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.title}
                className="max-h-[300px] md:max-h-[500px] w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-6xl opacity-50">📚</span>
            )}
          </div>

          {/* Content */}
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <div className="mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${book.condition === "new"
                  ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-900/40 text-amber-400 border border-amber-500/30"
                  }`}
              >
                {book.condition?.toUpperCase()}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-[#FDFBF7] mb-2">{book.title}</h1>
            <p className="text-xl text-[#D2B48C] mb-6 font-medium">{book.author}</p>

            <div className="prose prose-invert mb-8">
              <h3 className="text-xs uppercase tracking-widest text-[#8B4513] font-bold mb-2">
                Description
              </h3>
              <p className="text-[#D2B48C]/80 leading-relaxed">
                {book.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#D2B48C]/60 mb-8 pb-8 border-b border-[#8B4513]/30">
              <MapPin size={18} />
              <span>{book.location || "Unknown Location"}</span>
            </div>

            {/* Action - Status */}
            <div className="p-4 bg-[#3E2723]/50 rounded-xl border border-[#8B4513]/50">
              <p className="text-center text-[#D2B48C]/80">
                Current Owner:{" "}
                <span className="text-[#FDFBF7] font-bold ml-1">
                  {book.owner?.username}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;

import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthProvider";
import { Trash2 } from "lucide-react";

const EditBookModal = ({
  isOpen,
  onClose,
  book,
  onBookUpdated,
  onBookDeleted,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    condition: "new",
    image_url: "",
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        condition: book.condition || "new",
        image_url:
          book.book_images && book.book_images.length
            ? book.book_images[0].image_url
            : book.image_url || "",
      });
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `book_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("hackathon")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("hackathon").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      setLoading(false);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/books/${book.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update book");
      }

      // Backend returns updated book. Ensure consistency.
      const updated = { ...data };
      if (formData.image_url) {
        updated.book_images = [{ image_url: formData.image_url }];
      } else if (book.book_images) {
        updated.book_images = book.book_images;
      }

      onBookUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/books/${book.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete book");
      }

      onBookDeleted(book.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1a0f0a] border border-amber-900/30 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-6 border-b border-amber-900/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-100">Edit Book</h2>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 border border-red-500/20 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Preview / Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative group w-32 h-44 bg-[#2a1810] rounded-lg overflow-hidden border border-amber-900/30 shadow-lg">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-800 text-xs">
                    No Cover
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <span className="text-white text-xs font-semibold">
                    Change Cover
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Book Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#2a1810] border border-amber-900/30 rounded-lg px-3 py-2 text-amber-100 focus:ring-2 focus:ring-amber-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Author
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-[#2a1810] border border-amber-900/30 rounded-lg px-3 py-2 text-amber-100 focus:ring-2 focus:ring-amber-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#2a1810] border border-amber-900/30 rounded-lg px-3 py-2 text-amber-100 focus:ring-2 focus:ring-amber-700 outline-none"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full bg-[#2a1810] border border-amber-900/30 rounded-lg px-3 py-2 text-amber-100 focus:ring-2 focus:ring-amber-700 outline-none"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end items-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-amber-700 hover:text-amber-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookModal;

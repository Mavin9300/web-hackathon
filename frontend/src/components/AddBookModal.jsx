import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    condition: "new",
    image: null,
    image_url: "",
  });

  if (!isOpen) return null;

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
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          condition: formData.condition,
          image_url: formData.image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes("location")) {
          throw new Error(data.error); // "Please add your location..."
        }
        throw new Error(data.error || "Failed to add book");
      }

      onBookAdded(data);

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        condition: "new",
        image: null,
        image_url: "",
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-[#2C1A11] to-[#1a0f0a] border border-[#8B4513]/30 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#1a0f0a]">
        <div className="p-6 border-b border-[#8B4513]/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#FDFBF7]">Add New Book</h2>
          <button
            onClick={onClose}
            className="text-[#D2B48C] hover:text-[#FDFBF7] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 border border-red-500/20 text-sm">
              {error}
              {error.toLowerCase().includes("location") && (
                <div className="mt-2">
                  <Link
                    to="/profile"
                    className="text-[#FDFBF7] underline hover:text-[#C19A6B] font-medium"
                    onClick={onClose}
                  >
                    Go to Profile Settings
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#D2B48C] mb-1">
                Book Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg px-3 py-2 text-[#FDFBF7] focus:ring-2 focus:ring-[#C19A6B] outline-none placeholder-[#8B4513]/50"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D2B48C] mb-1">
                Author
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg px-3 py-2 text-[#FDFBF7] focus:ring-2 focus:ring-[#C19A6B] outline-none placeholder-[#8B4513]/50"
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D2B48C] mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg px-3 py-2 text-[#FDFBF7] focus:ring-2 focus:ring-[#C19A6B] outline-none placeholder-[#8B4513]/50"
                placeholder="Book description"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#D2B48C] mb-1">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full bg-[#1a0f0a] border border-[#8B4513]/30 rounded-lg px-3 py-2 text-[#FDFBF7] focus:ring-2 focus:ring-[#C19A6B] outline-none"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D2B48C] mb-1">
                Book Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-[#8B4513] hover:bg-[#A0522D] text-[#FDFBF7] py-2 px-4 rounded-lg border border-[#C19A6B]/30 transition-all text-sm">
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                {formData.image_url && (
                  <div className="h-10 w-10 rounded overflow-hidden border border-[#8B4513]/50">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#D2B48C] hover:text-[#FDFBF7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#8B4513] hover:bg-[#A0522D] text-[#FDFBF7] px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;

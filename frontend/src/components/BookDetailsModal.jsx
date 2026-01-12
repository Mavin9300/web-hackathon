import React, { useState } from "react";
import QRModal from "./QRModal";
import { X, QrCode } from "lucide-react";

const BookDetailsModal = ({ isOpen, onClose, book }) => {
  const [showQR, setShowQR] = useState(false);

  if (!isOpen || !book) return null;

  // Handle Image Display logic
  // BookModel returns `book_images: [{image_url: '...'}]` or empty
  const imageUrl =
    book.book_images && book.book_images.length > 0
      ? book.book_images[0].image_url
      : book.image_url; // fallback if just created/updated and attached manually

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#2C1A11] border border-[#8B4513] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
        >
          <X size={20} />
        </button>

        <div className="md:flex h-full max-h-[80vh] overflow-y-auto">
          {/* Image Section */}
          <div className="md:w-1/2 bg-[#1A100A] flex items-center justify-center min-h-[300px] border-r border-[#8B4513]/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={book.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-[#D2B48C]/50 flex flex-col items-center">
                <span className="text-4xl">📚</span>
                <span className="mt-2 text-sm">No Image Available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between bg-[#2C1A11]">
            <div>
              <div className="mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${book.condition === "new"
                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-900/40 text-amber-400 border border-amber-500/30"
                    }`}
                >
                  {book.condition.toUpperCase()}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-[#FDFBF7] mb-2">
                {book.title}
              </h2>
              <p className="text-xl text-[#D2B48C] mb-6 font-medium">{book.author}</p>

              <div className="space-y-4 text-[#FDFBF7]">
                <div>
                  <h4 className="text-xs text-[#8B4513] uppercase tracking-widest font-bold">
                    Description
                  </h4>
                  <p className="mt-1 leading-relaxed text-sm text-[#D2B48C]/80">
                    {book.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs text-[#8B4513] uppercase tracking-widest font-bold">
                    Location
                  </h4>
                  <p className="mt-1 text-sm text-[#D2B48C]">{book.location || "Unknown"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#8B4513]/30">
              <button
                onClick={() => setShowQR(true)}
                className="w-full bg-[#1A100A] hover:bg-[#3E2723] text-[#D2B48C] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-[#8B4513]/50 hover:text-[#FDFBF7] shadow-lg"
              >
                <QrCode className="w-5 h-5" />
                <span>Show QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrCode={book.qr_code}
        title={book.title}
      />
    </div>
  );
};

export default BookDetailsModal;

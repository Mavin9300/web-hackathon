import React from "react";
import { X } from "lucide-react";

const QRModal = ({ isOpen, onClose, qrCode, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <div className="bg-white rounded-xl p-2 relative max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-slate-300 transition"
        >
          <X size={32} />
        </button>

        <div className="flex flex-col items-center p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2 truncate max-w-full">
            {title}
          </h3>
          <p className="text-slate-500 text-sm mb-6">Scan to view details</p>

          {qrCode ? (
            <div className="bg-white p-2 rounded-lg border-2 border-slate-100 shadow-inner">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-slate-100 flex items-center justify-center rounded-lg text-slate-400">
              No QR Code Generated
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRModal;

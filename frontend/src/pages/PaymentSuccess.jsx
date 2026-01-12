import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { CheckCircle, XCircle, Home, ShoppingCart } from "lucide-react";
import { getAuthToken } from "../utils/token";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/verify-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setResultData(data);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  const Container = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#FDFBF7] p-8">
      <div className="bg-[#2C1A11] p-10 rounded-2xl border border-[#8B4513]/30 shadow-2xl max-w-lg w-full text-center">
        {children}
      </div>
    </div>
  );

  if (status === "verifying") {
    return (
      <Container>
        <Spin
          size="large"
          tip={<div className="text-[#D2B48C] mt-4">Verifying Payment...</div>}
        />
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container>
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#FDFBF7] mb-2">
          Payment Verification Failed
        </h2>
        <p className="text-[#D2B48C] mb-8">
          We couldn't verify your payment. If you were charged, please contact
          support.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#3E2723] text-[#D2B48C] hover:text-white py-3 rounded-xl border border-[#8B4513]/50 transition w-full font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/buy-points")}
            className="bg-[#8B4513] text-white py-3 rounded-xl hover:bg-[#6D3410] transition w-full font-bold"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-20 h-20 text-emerald-500 animate-bounce" />
      </div>
      <h2 className="text-3xl font-bold text-[#FDFBF7] mb-2">
        Payment Successful!
      </h2>
      <div className="bg-[#3E2723]/50 p-4 rounded-xl border border-[#D2B48C]/20 mb-6">
        <p className="text-[#D2B48C] text-sm mb-1">You have received</p>
        <p className="text-4xl font-bold text-emerald-400">
          {resultData?.pointsAdded} PTS
        </p>
        <div className="h-px bg-[#8B4513]/50 my-3"></div>
        <p className="text-[#D2B48C] text-sm">
          New Balance:{" "}
          <span className="text-[#FDFBF7] font-bold">
            {resultData?.newTotal} PTS
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#8B4513] text-white py-3 rounded-xl hover:bg-[#6D3410] transition w-full font-bold flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate("/buy-points")}
          className="bg-transparent text-[#D2B48C] hover:text-[#FDFBF7] py-3 rounded-xl hover:bg-[#3E2723] transition w-full font-medium flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Buy More
        </button>
      </div>
    </Container>
  );
};

export default PaymentSuccess;

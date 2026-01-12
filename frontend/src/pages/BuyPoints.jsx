import React, { useState } from "react";
import { Card, Button, Typography, Row, Col, message, Spin } from "antd";
import { ShoppingCart, CreditCard, Sparkles } from "lucide-react";
import { getAuthToken } from "../utils/token";

const { Title, Text } = Typography;

const PACKAGES = [
  {
    id: "POINTS_100",
    name: "100 Points",
    price: "$1.00",
    points: 100,
    color: "from-[#8B4513] to-[#5D4037]",
  },
  {
    id: "POINTS_500",
    name: "500 Points",
    price: "$4.50",
    points: 500,
    tag: "Best Value",
    color: "from-[#D2B48C] to-[#8B4513]",
  },
  {
    id: "POINTS_1000",
    name: "1000 Points",
    price: "$8.00",
    points: 1000,
    color: "from-[#FFD700] to-[#B8860B]",
  }, // Gold-theme for max
];

const BuyPoints = () => {
  const [loading, setLoading] = useState(false);

  const handleBuy = async (packageId) => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packageId }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        message.error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error buying points:", error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#FDFBF7]">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-[#2C1A11] rounded-full text-[#D2B48C] mb-4 border border-[#8B4513]/30">
            <CreditCard size={32} />
          </div>
          <h1 className="text-4xl font-bold text-[#FDFBF7] mb-2">Buy Points</h1>
          <p className="text-[#D2B48C] text-lg max-w-2xl mx-auto">
            Top up your points to request more books and engage with the
            community.
          </p>
        </div>

        <Spin
          spinning={loading}
          tip={
            <div className="text-[#D2B48C] mt-2">Redirecting to Stripe...</div>
          }
        >
          <Row gutter={[24, 24]} justify="center">
            {PACKAGES.map((pkg) => (
              <Col xs={24} sm={12} md={8} key={pkg.id}>
                <div
                  className={`relative h-full bg-[#2C1A11] rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                    pkg.tag
                      ? "border-[#D2B48C] shadow-lg shadow-[#D2B48C]/10 ring-1 ring-[#D2B48C]/30"
                      : "border-[#8B4513]/30 hover:border-[#8B4513]"
                  }`}
                >
                  {pkg.tag && (
                    <div className="absolute top-0 right-0 bg-[#D2B48C] text-[#2C1A11] text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                      {pkg.tag}
                    </div>
                  )}

                  <div
                    className={`h-24 bg-linear-to-br ${pkg.color} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <Sparkles className="text-white/20 absolute -bottom-4 -right-4 w-24 h-24" />
                    <h3 className="text-3xl font-bold text-white z-10 drop-shadow-md">
                      {pkg.points}
                    </h3>
                    <span className="text-white/80 ml-2 z-10 font-medium">
                      PTS
                    </span>
                  </div>

                  <div className="p-6 text-center">
                    <div className="text-4xl font-bold text-[#FDFBF7] mb-1">
                      {pkg.price}
                    </div>
                    <div className="text-[#D2B48C]/60 text-sm mb-6">
                      One-time payment
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleBuy(pkg.id)}
                      className="w-full h-12 rounded-xl bg-[#8B4513] hover:bg-[#6D3410] border-none text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
                    >
                      <ShoppingCart
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Purchase Now
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default BuyPoints;

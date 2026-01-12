import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined,
  BellOutlined,
  HeartOutlined,
  SwapOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { supabase } from "../services/supabaseClient";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
    { path: "/requests", label: "Requests", icon: <SwapOutlined /> },
    { path: "/wishlist", label: "Wishlist", icon: <HeartOutlined /> },
    { path: "/notifications", label: "Notifications", icon: <BellOutlined /> },
    { path: "/messages", label: "Messages", icon: <MessageOutlined /> },
    {
      path: "/exchange-stalls",
      label: "Exchange Stalls",
      icon: <ShopOutlined />,
    },
    { path: "/profile", label: "Profile", icon: <UserOutlined /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`h-screen w-64 bg-[#2C1A11]/95 backdrop-blur-xl text-[#FDFBF7] flex flex-col fixed left-0 top-0 border-r border-[#8B4513]/30 shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 border-b border-[#8B4513]/30 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] bg-clip-text text-transparent">
            BookExchange
          </h1>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden text-[#D2B48C]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                  ? "bg-[#D2B48C]/20 text-[#D2B48C] font-medium border border-[#D2B48C]/20"
                  : "hover:bg-[#3E2723]/50 text-[#D2B48C]/60 hover:text-[#FDFBF7]"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D2B48C] rounded-r-full" />
                )}
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#8B4513]/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#D2B48C]/60 hover:bg-[#3E2723]/50 hover:text-red-400 transition-all duration-200"
          >
            <LogoutOutlined className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

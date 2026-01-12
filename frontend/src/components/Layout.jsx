import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a0f0a]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#2C1A11]/95 backdrop-blur-xl border-b border-[#8B4513]/30 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-[#D2B48C] hover:bg-[#3E2723] rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="text-xl font-bold bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] bg-clip-text text-transparent">
          BookExchange
        </span>
      </div>

      <main className="lg:pl-64 min-h-screen transition-all duration-300 pt-16 lg:pt-0">
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

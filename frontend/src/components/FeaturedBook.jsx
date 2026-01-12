import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedBook = () => {
  const navigate = useNavigate();

  const assets = {
    bookCover: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e012b19e-9659-4501-89f4-f65f6ba9844b-izquhj-readdy-co/assets/images/ebcc71fc9f6a4508daf015379b9f632d-1.jpg"
  };

  const themes = ["Existentialism", "Mental Health", "Parallel Lives", "Self Discovery"];

  return (
    <section className="min-h-screen flex items-center justify-center py-12 md:py-24 px-4 md:px-6 bg-[#F5F1E8]">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-20 text-[#1A4228] leading-tight">
          The Interesting One!
        </h2>

        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-24">
          {/* Left Side: Rotated Book Cover */}
          <div className="relative w-80 h-[480px] flex-shrink-0 group">
            {/* Background rotation effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513] to-[#2C1A11] rounded-lg shadow-2xl transform rotate-3 scale-102 transition-transform duration-500 group-hover:rotate-1"></div>

            {/* Actual Book Image */}
            <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl transform -rotate-1 transition-transform duration-500 group-hover:rotate-0">
              <img
                src={assets.bookCover}
                alt="The Midnight Library Book Cover"
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Subtle overlay to enhance vintage feel */}
              <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side: Timeline-style Details */}
          <div className="flex-1 max-w-2xl space-y-12">
            {/* Book Title & Author */}
            <div className="relative pl-10 border-l-2 border-[#8B451333]">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-[#8B4513] rounded-full border-4 border-[#F5F1E8] shadow-sm"></div>
              <h3 className="text-3xl font-bold mb-2 text-[#2C1A11]">
                The Midnight Library
              </h3>
              <p className="text-xl italic text-[#8B4513]">
                by Matt Haig
              </p>
            </div>

            {/* Literary Analysis */}
            <div className="relative pl-10 border-l-2 border-[#8B451333]">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-[#8B4513] rounded-full border-4 border-[#F5F1E8] shadow-sm"></div>
              <h4 className="text-xl font-bold mb-4 text-[#2C1A11] tracking-wide uppercase text-sm">
                Literary Analysis
              </h4>
              <p className="text-base leading-relaxed text-[#2C1A11] opacity-90">
                A profound exploration of infinite possibilities and the weight of choices unmade.
                Haig masterfully weaves philosophical depth with accessible storytelling,
                creating a narrative that resonates with anyone who has ever wondered about the roads not taken.
              </p>
            </div>

            {/* Key Themes */}
            <div className="relative pl-10 border-l-2 border-[#8B451333]">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-[#8B4513] rounded-full border-4 border-[#F5F1E8] shadow-sm"></div>
              <h4 className="text-xl font-bold mb-5 text-[#2C1A11] tracking-wide uppercase text-sm">
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-3">
                {themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-5 py-2 bg-[#FDFBF7] border border-[#8B451333] text-[#8B4513] rounded-md text-sm font-medium hover:bg-[#8B4513] hover:text-[#FDFBF7] transition-colors duration-300 cursor-default"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Perfect For */}
            <div className="relative pl-10 border-l-2 border-[#8B451333]">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-[#8B4513] rounded-full border-4 border-[#F5F1E8] shadow-sm"></div>
              <h4 className="text-xl font-bold mb-4 text-[#2C1A11] tracking-wide uppercase text-sm">
                Perfect For
              </h4>
              <p className="text-base text-[#2C1A11] opacity-90">
                Readers seeking contemplative fiction, fans of philosophical narratives, and anyone navigating life's crossroads.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-[#2C1A11] text-[#FDFBF7] text-lg font-semibold rounded-md shadow-lg hover:bg-[#1A4228] hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                Request Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBook;

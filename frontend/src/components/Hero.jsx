import React, { useRef, useEffect, useState } from 'react';

export default function Hero() {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const sectionRect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1)
      const scrollableDistance = sectionHeight - viewportHeight;
      const progress = Math.max(0, Math.min(1, -sectionRect.top / scrollableDistance));

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate animation values based on scroll progress
  const bookHeight = 500 + (scrollProgress * 1800); // Grows from 500px to 2300px

  // Calculate which content to show based on height - show immediately
  const showPage1 = bookHeight > 400;
  const showPage2 = bookHeight > 600;
  const showPage3 = bookHeight > 1000;
  const showPage4 = bookHeight > 1500;

  return (
    <section
      ref={sectionRef}
      className="h-[400vh] relative bg-[#8B4513] overflow-hidden selection:bg-[#FDFBF7] selection:text-[#8B4513]"
    >
      {/* Corner decorations */}
      <div className="hidden md:block fixed top-8 left-8 w-16 md:w-24 h-16 md:h-24 border-t-4 border-l-4 border-[#FDFBF7] opacity-80 z-10" />
      <div className="hidden md:block fixed top-8 right-8 w-16 md:w-24 h-16 md:h-24 border-t-4 border-r-4 border-[#FDFBF7] opacity-80 z-10" />
      <div className="hidden md:block fixed bottom-8 left-8 w-16 md:w-24 h-16 md:h-24 border-b-4 border-l-4 border-[#FDFBF7] opacity-80 z-10" />
      <div className="hidden md:block fixed bottom-8 right-8 w-16 md:w-24 h-16 md:h-24 border-b-4 border-r-4 border-[#FDFBF7] opacity-80 z-10" />

      <div className="sticky top-0 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center relative z-20 w-full">

          {/* Title that scales down and moves up */}
          <div
            className="transition-all duration-700 mb-8"
            style={{
              opacity: Math.max(0.3, 1 - scrollProgress),
              transform: `scale(${1 - scrollProgress * 0.5}) translateY(${-scrollProgress * 80}px)`,
            }}
          >
            <p className="text-sm md:text-lg tracking-[0.3em] text-[#FDFBF7] mb-4 md:mb-6 font-semibold uppercase">
              How to Exchange
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-9xl lg:text-[12rem] text-[#FDFBF7] leading-[0.9] drop-shadow-sm whitespace-nowrap">
              BookExchange
            </h1>
          </div>

          {/* The expanding book */}
          <div
            className="relative w-full max-w-3xl mx-auto transition-all duration-500 ease-out overflow-hidden"
            style={{
              height: `${Math.min(bookHeight, 2300)}px`,
            }}
          >
            <div className="relative w-full h-full bg-[#FDFBF7] rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">

              {/* Book spine/header - sticky at top */}
              <div className="sticky top-0 left-0 w-full h-16 bg-gradient-to-b from-[#8B4513] via-[#A0522D] to-[#8B4513] shadow-2xl z-40 flex items-center justify-center border-y border-[#2C1A11]/20">
                <p className="text-[#FDFBF7] text-sm font-bold tracking-[0.5em]">BOOKEXCHANGE</p>
              </div>

              {/* Content flows vertically */}
              <div className="relative">

                {/* Page 1: Cover - Always visible */}
                <div
                  className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F1E8] p-8 md:p-12 flex flex-col items-center justify-center transition-all duration-700"
                  style={{
                    minHeight: '450px',
                    opacity: showPage1 ? 1 : 0,
                    transform: showPage1 ? 'translateY(0)' : 'translateY(-20px)',
                  }}
                >
                  <div className="border-4 border-[#8B4513] p-8 md:p-12 w-full max-w-xl flex flex-col items-center justify-center">
                    <p className="text-xs tracking-[0.3em] text-[#8B4513] mb-6 uppercase">Classic Edition</p>
                    <h2 className="text-4xl md:text-6xl font-bold text-[#2C1A11] mb-8 text-center leading-tight">
                      The Art of<br />Book Trading
                    </h2>
                    <div className="w-32 h-1 bg-[#8B4513] mb-8"></div>
                    <p className="text-base text-[#8B4513] tracking-wider font-medium">EST. 2024</p>
                  </div>
                </div>

                {/* Page 2: Philosophy */}
                {showPage2 && (
                  <div
                    className="bg-[#FDFBF7] p-8 md:p-12 border-t-4 border-[#8B4513]/20 transition-all duration-700"
                    style={{
                      opacity: showPage2 ? 1 : 0,
                      transform: showPage2 ? 'translateY(0)' : 'translateY(-20px)',
                    }}
                  >
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-4xl md:text-5xl font-bold text-[#2C1A11] mb-3">
                        Appendix A
                      </h2>
                      <p className="text-xl text-[#8B4513] italic mb-8">A Guide to Literary Exchange</p>

                      <h3 className="text-2xl md:text-3xl font-bold text-[#8B4513] mb-4">
                        I. The Philosophy
                      </h3>
                      <p className="text-[#2C1A11] leading-relaxed opacity-90">
                        Every book carries within its pages not merely words, but worlds—universes of thought, emotion, and human experience. The act of exchanging books transcends mere transaction; it becomes a sacred passing of knowledge from one soul to another.
                      </p>
                    </div>
                  </div>
                )}

                {/* Page 3: Method */}
                {showPage3 && (
                  <div
                    className="bg-[#FDFBF7] p-8 md:p-12 border-t-4 border-[#8B4513]/20 transition-all duration-700"
                    style={{
                      opacity: showPage3 ? 1 : 0,
                      transform: showPage3 ? 'translateY(0)' : 'translateY(-20px)',
                    }}
                  >
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-2xl md:text-3xl font-bold text-[#8B4513] mb-6">
                        II. The Method
                      </h3>
                      <p className="text-[#2C1A11] leading-relaxed mb-6 opacity-90">
                        Our platform employs a sophisticated algorithm to match readers with their ideal literary companions:
                      </p>
                      <ul className="space-y-3 text-[#2C1A11] mb-8">
                        <li className="flex items-start gap-3">
                          <span className="text-[#8B4513] mt-1">•</span>
                          <span>Analyze reading preferences</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[#8B4513] mt-1">•</span>
                          <span>Calculate compatibility scores</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[#8B4513] mt-1">•</span>
                          <span>Facilitate seamless exchanges</span>
                        </li>
                      </ul>
                      <div className="border-l-4 border-[#8B4513] pl-6 py-2">
                        <p className="text-[#8B4513] italic">
                          "A book is a dream that you hold in your hand." — Neil Gaiman
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 4: Journey */}
                {showPage4 && (
                  <div
                    className="bg-gradient-to-br from-[#F5F1E8] to-[#FDFBF7] p-8 md:p-12 border-t-4 border-[#8B4513]/20 transition-all duration-700"
                    style={{
                      opacity: showPage4 ? 1 : 0,
                      transform: showPage4 ? 'translateY(0)' : 'translateY(-20px)',
                    }}
                  >
                    <div className="max-w-2xl mx-auto space-y-6">
                      <h2 className="text-4xl md:text-5xl font-bold text-[#2C1A11] mb-3">
                        Chapter One
                      </h2>
                      <p className="text-xl text-[#8B4513] italic mb-8">The Beginning of Your Journey</p>

                      <p className="text-[#2C1A11] leading-relaxed opacity-90">
                        In the quiet corners of forgotten libraries, a revolution is taking place. Readers are no longer passive consumers but active participants in a grand literary exchange.
                      </p>

                      <p className="text-[#2C1A11] leading-relaxed opacity-90">
                        Each book you share becomes a bridge between minds, a connection that transcends time and space. Your collection transforms into a living library, breathing with the stories of countless readers who came before you.
                      </p>

                      <div className="border-l-4 border-[#8B4513] pl-6 py-4 bg-white/50 rounded-r my-6">
                        <p className="text-[#2C1A11] italic leading-relaxed">
                          "The only thing better than discovering a great book is sharing it with someone who will love it as much as you did."
                        </p>
                      </div>

                      <p className="text-[#2C1A11] leading-relaxed opacity-90">
                        Through our platform, every exchange tells a story. The thriller that kept you up all night finds its way to another insomniac. The poetry collection that moved you to tears comforts a kindred spirit across town.
                      </p>

                      <p className="text-[#2C1A11] leading-relaxed opacity-90">
                        Welcome to a community where books are not possessions, but experiences to be shared. Where the end of one reader's journey marks the beginning of another's adventure.
                      </p>

                      <div className="text-center pt-8 border-t border-[#8B4513]/20 mt-8">
                        <p className="text-[#8B4513] font-semibold tracking-wider">
                          Your story begins here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator - fades out as user scrolls */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
          >
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <p className="text-[#FDFBF7] text-sm tracking-wider">Scroll to explore</p>
              <svg className="w-6 h-6 text-[#FDFBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

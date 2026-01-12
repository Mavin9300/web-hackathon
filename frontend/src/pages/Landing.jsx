import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedBook from '../components/FeaturedBook';
import CuratedBooks from '../components/CuratedBooks';
import Features from '../components/Features';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedBook />
      <CuratedBooks />
      <Features />
      <FAQ />
      
      {/* Footer with padding to prevent overlap with sticky CTA */}
      <div className="pb-16 sm:pb-20">
        <Footer />
      </div>

      {/* Sticky CTA Footer - Responsive */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] shadow-2xl z-50 border-t border-[#8B4513]/20">
        <div className="w-full px-4 md:px-16 py-3 md:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-[#2C1A11] md:pl-12 text-center sm:text-left">
            <p className="text-sm md:text-base font-bold">Join us in the literary revolution</p>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="bg-[#8B4513] hover:bg-[#6B3410] text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg text-sm md:mr-12 w-full sm:w-auto"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
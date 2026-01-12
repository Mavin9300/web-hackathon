import React from 'react';

const Footer = () => {
  return (
    <footer className="py-16 px-4 bg-[#8B4513] text-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-[#FDFBF7]">
              BookExchange
            </h3>
            <p className="text-base leading-relaxed opacity-90 max-w-xs">
              Connecting readers, one book at a time. Join our community of literary enthusiasts.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-[#FDFBF7]">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  List Your Books
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-[#FDFBF7]">
              Community
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Book Clubs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Discussion Forums
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Author Events
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-[#FDFBF7]">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#FDFBF7]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-80">
              © 2024 BookExchange. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                Facebook
              </a>
              <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                Twitter
              </a>
              <a href="#" className="text-sm hover:text-[#2C1A11] transition-colors duration-300">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

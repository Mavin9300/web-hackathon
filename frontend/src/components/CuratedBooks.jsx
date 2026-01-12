import React from 'react';
import { useNavigate } from 'react-router-dom';

const books = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e012b19e-9659-4501-89f4-f65f6ba9844b-izquhj-readdy-co/assets/images/cd4fdd445bb627d35250c61c5494c389-2.jpg",
    alt: "Pride and Prejudice book cover"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e012b19e-9659-4501-89f4-f65f6ba9844b-izquhj-readdy-co/assets/images/images_3.png",
    alt: "The Great Gatsby book cover"
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e012b19e-9659-4501-89f4-f65f6ba9844b-izquhj-readdy-co/assets/images/images_4.png",
    alt: "Wuthering Heights book cover"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e012b19e-9659-4501-89f4-f65f6ba9844b-izquhj-readdy-co/assets/images/images_5.png",
    alt: "To Kill a Mockingbird book cover"
  }
];

const CuratedBooks = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-24 px-4 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-[#1A4228]">
            Curated for You
          </h2>
          <p className="text-lg md:text-xl text-[#8B4513] max-w-2xl mx-auto">
            Handpicked selections based on timeless literary merit and reader recommendations
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {books.map((book, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative w-full h-[420px] mb-4 overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 bg-[#F5F1E8]">
                <img
                  src={book.image}
                  alt={book.alt}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A11]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2 bg-[#FDFBF7] text-[#2C1A11] font-semibold rounded-md whitespace-nowrap transition-colors hover:bg-white"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Title & Author */}
              <h3 className="text-xl font-bold mb-1 text-[#2C1A11] leading-tight">
                {book.title}
              </h3>
              <p className="text-base text-[#8B4513]">
                {book.author}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-12 py-4 bg-[#8B4513] text-[#FDFBF7] text-lg font-semibold rounded-md hover:bg-[#2C1A11] transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl"
          >
            Explore More Books
          </button>
        </div>
      </div>
    </section>
  );
};

export default CuratedBooks;

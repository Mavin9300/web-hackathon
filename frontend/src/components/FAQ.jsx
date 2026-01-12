import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b-2 border-[#8B451333]">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-semibold text-[#2C1A11] pr-8 group-hover:text-[#8B4513] transition-colors duration-300">
          {question}
        </h3>
        <ChevronDown
          className={`w-6 h-6 text-[#8B4513] transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] pb-6 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <p className="text-base leading-relaxed text-[#2C1A11]">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does the book exchange system work?",
      answer:
        "Simply list books you're willing to exchange, browse available titles, and request exchanges. Once both parties agree, we facilitate the exchange process. You earn points for each successful exchange that can be used for future trades.",
    },
    {
      question: "What condition should books be in?",
      answer:
        "We accept books in good readable condition. Minor wear is acceptable, but books should be complete with all pages intact. Each listing includes a condition rating to help you make informed decisions.",
    },
    {
      question: "How are shipping costs handled?",
      answer:
        "Each user covers their own shipping costs when sending a book. We provide discounted shipping labels through our partner carriers. For local exchanges, you can arrange in person meetups.",
    },
    {
      question: "Can I sell books instead of exchanging them?",
      answer:
        "BookExchange focuses on trading and community building rather than monetary transactions. However, you can use accumulated exchange points to request books without offering one in return.",
    },
    {
      question: "How does the AI recommendation system work?",
      answer:
        "Our AI analyzes your reading history, preferences, ratings, and similar readers' choices to suggest books you'll love. The more you use the platform, the better the recommendations become.",
    },
    {
      question: "Is there a membership fee?",
      answer:
        "Basic membership is completely free. We offer a premium tier with additional features like priority matching, exclusive author events, and enhanced recommendations for $9.99/month.",
    },
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 md:py-24 px-4 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-[3.75rem] leading-[1.1] font-bold text-center mb-6 text-[#2C1A11]">
          Frequently Asked Questions
        </h2>
        <p className="text-lg md:text-xl text-center text-[#8B4513] mb-10 md:mb-16 max-w-2xl mx-auto">
          Everything you need to know about BookExchange
        </p>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

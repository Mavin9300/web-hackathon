import React from "react";
import { Brain, Coins, Users, BookOpen } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "AI Matching",
      description:
        "Smart recommendations based on your taste, reading history, and literary preferences.",
      icon: Brain,
    },
    {
      title: "Exchange Points",
      description:
        "Trade books to earn credits. Every exchange brings you closer to your next great read.",
      icon: Coins,
    },
    {
      title: "Community",
      description:
        "Join book clubs and discussions with fellow bibliophiles who share your passion.",
      icon: Users,
    },
    {
      title: "Original Books",
      description:
        "Exclusive indie authors and rare editions you won't find anywhere else.",
      icon: BookOpen,
    },
  ];

  return (
    <section className="py-12 md:py-24 px-4 bg-[#F5F1E8]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-[3.75rem] leading-[1.1] font-bold text-center mb-4 md:mb-6 text-[#1A4228]">
          Why BookExchange?
        </h2>

        <p className="text-lg md:text-xl text-center text-[#8B4513] mb-12 md:mb-20 max-w-2xl mx-auto">
          More than a platform a community dedicated to the art of reading
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center group flex flex-col items-center">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-[#FDFBF7] border-2 border-[#8B4513] rounded-full text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-[#FDFBF7] transition-all duration-300 ease-in-out shadow-sm">
                  <IconComponent className="w-10 h-10" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-[#2C1A11]">
                  {feature.title}
                </h3>

                <p className="text-base leading-relaxed text-[#2C1A11] max-w-[280px] mx-auto opacity-90">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

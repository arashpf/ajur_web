import React from "react";

const cards = [
  {
    id: 1,
    title: "بهترین املاک",
    description: "برترین آژانس های املاک شهر شما.",
    icon: "estate",
  },
  // {
  //   id: 2,
  //   title: "بازاریابی",
  //   description: "شرکت در کمپین‌های تبلیغاتی و بازاریابی",
  //   icon: "marketing",
  // },
  {
    id: 2,
    title: "بهترین مشاوران",
    description: "مشاوران برتر و باتجربه آجر",
    icon: "agent",
  },
  {
    id: 3,
    title: "بهترین دپارتمان‌ها",
    description: "دسترسی به بهترین دپارتمان‌های املاک",
    icon: "department",
  },
  // Coming soon greyed-out cards
  {
    id: 4,
    title: "برترین سازنده ها",
    description: "برترین سازنده های حوزه املاک",
    icon: "clock",
    disabled: true,
    soonLabel: "به زودی !",
  },
  {
    id: 5,
    title: "بهترین مشاغل",
    description: "بهترین کسب‌وکارهای مرتبط با املاک",
    icon: "clock",
    disabled: true,
    soonLabel: "به زودی !",
  },
  {
    id: 6,
    title: "برترین کارشناسان",
    description: "مشاوران و کارشناسان خبره",
    icon: "clock",
    disabled: true,
    soonLabel: "به زودی !",
  },
];

export default function BestSection() {
  return (
    <section dir="rtl" className="pb-24 pt-12 px-4 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Cards Grid - Dynamic centering for any number of cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => {
                  // Empty onClick - to be filled by friend
                }}
                className={`group relative overflow-hidden ${card.disabled ? 'cursor-default' : 'cursor-pointer'} h-full w-full max-w-sm animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Moving Neon Border Container */}
                <div className="relative h-full overflow-hidden rounded-3xl p-[3px] isolate transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                  {/* Subtle neutral decoration removed to avoid overpowering borders. */}

                  {/* Inner Card Content */}
                  <div className={`relative h-full w-full rounded-[22px] p-8 flex flex-col justify-between overflow-hidden ${card.disabled ? 'bg-gray-50 text-black border border-gray-200 pointer-events-none' : 'bg-white/95 border border-gray-100 shadow-2xl hover:shadow-2xl hover:-translate-y-1 ring-1 ring-gray-200'}`}>
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Animated background particles */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/50 rounded-full blur-3xl animate-float" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/50 rounded-full blur-3xl animate-float-delayed" />

                    <div className="relative z-10">
                      {card.disabled && (
                        <div className="absolute top-3 left-3 bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[11px] font-semibold z-20">{card.soonLabel}</div>
                      )}
                      {/* Icon with animation */}
                      <div className={`w-20 h-20 bg-white backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}> 
                        <svg
                          className={`w-10 h-10 ${card.disabled ? 'text-red-500' : 'text-[#D93025]'}`}
                          strokeWidth={2}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {card.icon === "estate" && (
                            <>
                              <path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1v-8z" />
                              <path d="M9 21v-6h6v6" />
                            </>
                          )}

                          {card.icon === "marketing" && (
                            <>
                              {/* Airhorn / megaphone icon */}
                              <path d="M2 11v2h4l7 4V7L6 11H2z" />
                              <path d="M20 8v8" />
                              <path d="M18 6l4 4-4 4" />
                            </>
                          )}

                          {card.icon === "agent" && (
                            <>
                              <circle cx="12" cy="7" r="3" fill="none" />
                              <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
                            </>
                          )}

                          {card.icon === "department" && (
                            <>
                              {/* Building icon */}
                              <path d="M3 21h18V8l-9-5-9 5v13z" />
                              <path d="M9 10v4" />
                              <path d="M15 10v4" />
                              <path d="M9 16v2" />
                              <path d="M15 16v2" />
                            </>
                          )}

                          {card.icon === "clock" && (
                            <>
                              <circle cx="12" cy="12" r="8" />
                              <path d="M12 8v5l3 2" />
                            </>
                          )}
                        </svg>
                      </div>

                      {/* Content */}
                      <h3 className={`text-2xl font-bold mb-3 text-balance iransans-heading ${card.disabled ? 'text-black' : 'text-gray-900'}`}>
                        {card.title}
                      </h3>
                      <p className={`font-medium text-base leading-relaxed text-balance iransans ${card.disabled ? 'text-gray-700' : 'text-gray-800'}`}>
                        {card.description}
                      </p>
                    </div>

                    {/* Hover indicator */}
                    <div className="relative z-10 mt-6 transition-transform duration-300">
                      {!card.disabled && (
                        <div className="flex items-center gap-2 text-gray-700 group-hover:text-[#D93025] transition-colors font-semibold">
                          <span className="text-sm">مشاهده بیشتر</span>
                          <svg
                            className="w-5 h-5 animate-arrow-bounce"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.08;
          }
        }

        @keyframes pulse-slower {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.04;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.07;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3) rotate(90deg);
            opacity: 0.5;
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2) rotate(-90deg);
            opacity: 0.4;
          }
        }

        @keyframes arrow-bounce {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-4px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite 2s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite 1s;
        }

        .animate-arrow-bounce {
          animation: arrow-bounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
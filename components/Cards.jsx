import React from "react";

// Simple inline ArrowLeft icon
const ArrowLeft = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="16"
    height="16"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M14 6L8 12l6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Cards component accepts features = [{ id, title, description, illustration, action, onClick }]
export default function Cards({ features = [] }) {
  const [hovered, setHovered] = React.useState(null);
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <style jsx>{`
        @font-face {
          font-family: 'Iran Sans';
          src: url('/fonts/iran-sans.ttf') format('truetype');
          font-weight: 400 900;
          font-style: normal;
          font-display: swap;
        }
        h1 { font-family: 'Iran Sans', 'Sahel', sans-serif; }
        h3 { font-family: 'Iran Sans', 'Sahel', sans-serif; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            // Make buy/rent/register actions use the red hover style
            const isRed = ["ثبت آگهی", "خرید", "اجاره"].includes(feature.title || feature.action);
            return (
            <div
              key={feature.id}
              className="group transform transition-all duration-300"
              style={{ willChange: "transform, opacity" }}
              // make entire card clickable optionally
              onClick={(e) => {
                if (!feature.onClick) return;
                // prevent double-invocation when clicking inner button
                if (e.target.closest("button")) return;
                feature.onClick(e);
              }}
            >
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 h-full flex flex-col gap-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-300/40`}>
                {/* Illustration */}
                <div className="mx-auto transition-transform duration-300 group-hover:scale-105">
                  <div className="relative w-52 h-52 mx-auto">
                    <img
                      src={feature.illustration || "/placeholder.svg"}
                      alt={feature.title || "illustration"}
                      className="w-full h-full object-contain drop-shadow-lg"
                      style={{ display: "block" }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-4 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-balance">
                    {feature.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof feature.onClick === "function") feature.onClick(e);
                  }}
                  onMouseEnter={() => setHovered(feature.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full py-3.5 px-7 rounded-full text-white font-bold text-base hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background:
                      isRed && hovered === feature.id
                        ? "linear-gradient(135deg,#B8322C,#8F251F)"
                        : "linear-gradient(135deg,#7C7A75,#2F2F2F)",
                  }}
                >
                  {feature.action}
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}

import React from "react";

const ActionCard = ({ image, title, description, onClick, buttonText }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="action-card cursor-pointer rounded-2xl border border-gray-200 bg-white flex flex-col items-center w-full h-full"
    >
      {/* Image - Always on top in column layout */}
      <div className="flex-shrink-0 w-full aspect-[1/1] overflow-hidden rounded-t-2xl bg-gray-50">
        <img
          src={image}
          alt={title}
          className="w-64 h-64 md:w-80 md:h-80 mx-auto mt-8 object-cover object-center"
        />
      </div>

      {/* Text section */}
      <div className="flex-1 p-6 text-center w-full flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
        </div>

        {/* CTA Button - Only element with hover effects */}
        <button
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ActionCard;

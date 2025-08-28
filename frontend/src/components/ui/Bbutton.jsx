import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

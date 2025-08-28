
// src/components/ui/Card.jsx
import React from 'react';

export const BookCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-lg rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};

export const BookCardContent = ({ children }) => {
  return <div className="mt-4 flex-grow">{children}</div>;
};


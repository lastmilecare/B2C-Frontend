import React from 'react';

export const baseInput = "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn = "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2 transition-colors";

export const Input = ({ label, required, error, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-sm text-gray-600 block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`${baseInput} ${error ? "border-red-500" : "border-gray-300"} ${className}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const Select = ({ label, required, error, children, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-sm text-gray-600 block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`${baseInput} ${error ? "border-red-500" : "border-gray-300"} ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const Button = ({ variant = "sky", children, className = "", ...props }) => {
  const variants = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`,
    green: `${baseBtn} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`,
    outline: `${baseBtn} border border-gray-300 text-gray-700 hover:bg-gray-100`,
  };
  
  const variantClass = variants[variant] || variants.sky;

  return (
    <button {...props} className={`${variantClass} ${className}`}>
      {children}
    </button>
  );
};
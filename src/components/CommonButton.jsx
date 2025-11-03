import React from "react";

export default function CommonButton({ type = "button", children, onClick, className = "", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2.5 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-all focus:ring-2 focus:ring-teal-400 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

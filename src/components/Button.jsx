import React from "react";

const Button = ({ variant = "primary", children, ...rest }) => {
  const base = "px-4 py-2 rounded-md font-medium shadow-sm focus:outline-none";
  const variants = {
    primary: "bg-medical-500 text-white hover:bg-medical-700",
    outline: "border border-medical-500 text-medical-700",
    ghost: "text-medical-700 hover:bg-medical-50",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;

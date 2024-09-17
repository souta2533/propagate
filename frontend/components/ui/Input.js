import React from "react";

const Input = ({ type = "text", placeholder, className, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`input-base ${className}`}
      value={value}
      onChange={onChange}
    />
  );
};

export { Input };

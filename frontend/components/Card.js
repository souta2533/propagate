import React from "react";

export const Card = ({ children, className, onClick }) => {
  return (
    <div className={`card-base ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className }) => {
  return <h2 className={`card-title ${className}`}>{children}</h2>;
};

export const CardContent = ({ children, className }) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};

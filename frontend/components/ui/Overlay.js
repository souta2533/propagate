import React from "react";

const Overlay = ({ isOpen, toggleMenu }) => {
  return (
    <div
      className={`overlay ${isOpen ? "active" : ""}`}
      onClick={toggleMenu}
    ></div>
  );
};

export default Overlay;

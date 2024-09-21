import React from "react";

function Overlay({ isOpen, toggleMenu }) {
  if (!isOpen) return null;

  return (
    <div
      className={`overlay ${isOpen ? "active" : ""}`}
      onClick={toggleMenu}
    ></div>
  );
}

export default Overlay;

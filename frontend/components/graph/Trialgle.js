import React, { useState, useEffect } from "react";
//import { createRoot } from "react-dom/client";

const Triangle = ({
  wPercent = 10, // 幅の割合
  hPercent = 10, // 高さの割合
  direction = "right",
  color = "#44a6e8",
}) => {
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth * (wPercent / 100);
      const height = window.innerHeight * (hPercent / 100);
      setDimensions({ w: width, h: height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [wPercent, hPercent]);

  const points = {
    top: [
      `${dimensions.w / 2},0`,
      `0,${dimensions.h}`,
      `${dimensions.w},${dimensions.h}`,
    ],
    right: [`0,0`, `0,${dimensions.h}`, `${dimensions.w},${dimensions.h / 2}`],
    bottom: [`0,0`, `${dimensions.w},0`, `${dimensions.w / 2},${dimensions.h}`],
    left: [
      `${dimensions.w},0`,
      `${dimensions.w},${dimensions.h}`,
      `0,${dimensions.h / 2}`,
    ],
  };

  const pointArray = points[direction];
  if (!pointArray) {
    console.error(`Invalid direction: ${direction}`);
    return null;
  }

  return (
    <svg width={dimensions.w} height={dimensions.h} className="triangle-chart">
      <polygon points={pointArray.join(" ")} fill={color} />
      Sorry, your browser does not support inline SVG.
    </svg>
  );
};

export default Triangle;

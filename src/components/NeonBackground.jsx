import React from "react";
import { useSelector } from "react-redux";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiBinance, SiDogecoin, SiRipple } from "react-icons/si";
import "../styles/NeonBackground.css";

const ICONS = [
  { Component: FaBitcoin, color: "#f7931a" },
  { Component: FaEthereum, color: "#3c3c3d" },
  { Component: SiBinance, color: "#f3ba2f" },
  { Component: SiDogecoin, color: "#c2a633" },
  { Component: SiRipple, color: "#0085c0" },
];

const NUM_ICONS = 10;

const getRandomPosition = () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  fontSize: `${Math.random() * 3 + 2}rem`,
  opacity: Math.random() * 0.2 + 0.1,
  transform: `rotate(${Math.random() * 360}deg)`,
});

const NeonBackground = ({ children }) => {
  const { isDarkMode } = useSelector((state) => state.theme);

  return (
    <div
      className={`neon-background ${isDarkMode ? "dark-mode" : "light-mode"}`}
    >
      {Array.from({ length: NUM_ICONS }).map((_, index) => {
        const { Component, color } =
          ICONS[Math.floor(Math.random() * ICONS.length)];
        const style = { ...getRandomPosition(), color };
        return <Component key={index} className="neon-icon" style={style} />;
      })}
      {children}
    </div>
  );
};

export default NeonBackground;

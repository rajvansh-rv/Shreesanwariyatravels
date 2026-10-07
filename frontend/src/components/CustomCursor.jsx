import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let animId;

    const handleMouseMove = (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      setPosition({ x: dotX, y: dotY });
    };

    const animate = () => {
      ringX += (dotX - ringX) * 0.15;
      ringY += (dotY - ringY) * 0.15;
      setRingPosition({ x: ringX, y: ringY });
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animId = requestAnimationFrame(animate);

    const hoverTargets = "a, button, input, select, textarea, .dest-card, .car-card, .feature-card";
    const handleMouseOver = (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.add("cursor-hover");
      }
    };
    const handleMouseOut = (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.remove("cursor-hover");
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        className="cursor-dot"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div
        className="cursor-ring"
        style={{ left: `${ringPosition.x}px`, top: `${ringPosition.y}px` }}
      />
    </>
  );
}

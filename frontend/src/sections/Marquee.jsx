import React from "react";

export default function Marquee() {
  const items = [
    "Shri Mahakaleshwar Jyotirlinga",
    "Omkareshwar",
    "Baglamukhi",
    "Sanwariya Seth",
    "Khatu Shyam",
    "Jaipur",
    "Udaipur",
    "Salasar Balaji",
    "Rishikesh",
    "Chittorgarh",
    "Bhopal",
    "Goa",
    "Kerala",
    "Somnath",
    "Kedarnath"
  ];

  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {[...items, ...items].map((item, idx) => (
          <span key={idx}>✦ {item} </span>
        ))}
      </div>
    </div>
  );
}

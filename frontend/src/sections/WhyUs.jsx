import React from "react";

export default function WhyUs() {
  const features = [
    {
      icon: "fa-shield-halved",
      title: "100% Safe & Verified",
      desc: "All drivers are background-checked, licensed, and trained in first aid for your safety."
    },
    {
      icon: "fa-clock",
      title: "24/7 Support",
      desc: "Round-the-clock customer support. We're always just a call away during your journey."
    },
    {
      icon: "fa-indian-rupee-sign",
      title: "Best Price Guarantee",
      desc: "Transparent pricing with no hidden charges. We match any comparable quote — guaranteed."
    },
    {
      icon: "fa-star",
      title: "Premium Experience",
      desc: "Spotless vehicles, professional drivers, and curated itineraries for every trip."
    }
  ];

  return (
    <section id="why" className="section">
      <div className="section-header">
        <p className="section-label">Why thousands trust us</p>
        <h2 className="section-title">The Sanwariya <em>Promise</em></h2>
      </div>
      <div className="features-grid">
        {features.map((item, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

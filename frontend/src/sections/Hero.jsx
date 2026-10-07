import React, { useEffect, useState } from "react";

export default function Hero() {
  const [stats, setStats] = useState({ happy: 0, exp: 0, dest: 0 });

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setStats({
        happy: Math.min(Math.floor((count / 50) * 12), 12),
        exp: Math.min(Math.floor((count / 50) * 8), 8),
        dest: Math.min(Math.floor((count / 50) * 50), 50),
      });
      if (count >= 50) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero">
      <div className="hero-bg"></div>

      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-badge">✦ Trusted Taxi & Tour Services in Ujjain ✦</p>
          <h1 className="hero-title">
            <span className="title-line">Explore Ujjain &</span>
            <span className="title-line title-accent">Incredible India</span>
            <span className="title-line">with Us</span>
          </h1>
          <p className="hero-sub">
            Reliable taxi, cab rental, and tour packages across Ujjain, Madhya Pradesh & all of India. Experience comfort, safety & memorable journeys with verified drivers.
          </p>

          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollToSection("book")}>
              <span>Book Your Journey</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button className="btn-ghost" onClick={() => scrollToSection("destinations")}>
              <i className="fa-solid fa-compass"></i>
              <span>Explore Destinations</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>{stats.happy}K+</strong>
              <span>Happy Travellers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <strong>{stats.exp}+</strong>
              <span>Years Experience</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <strong>{stats.dest}+</strong>
              <span>Destinations</span>
            </div>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-image-card">
            <img src="/img/hero-bg.jpg" alt="Shree Sanwariya Travels - Taxi & Tour Services in Ujjain" />
            <div className="hero-image-badge">
              <i className="fa-solid fa-shield-heart"></i>
              <div>
                <strong>Top Rated Travel Partner</strong>
                <span>Ujjain & All India Tours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint" onClick={() => scrollToSection("destinations")}>
        <span>Scroll to explore</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
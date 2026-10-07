import React, { useState } from "react";

const destinationsData = [
  {
    id: "mahakaleshwar",
    title: "Shri Mahakaleshwar Jyotirlinga, Ujjain",
    state: "Madhya Pradesh",
    image: "/img/mahakaltemple.jpg",
    description: "The divine abode of Mahakal, stands as one of the most sacred Shiva temples in India.",
    temp: "21°C – 41°C",
    icon: "fa-temperature-low"
  },
  {
    id: "omkareshwar",
    title: "Omkareshwar Jyotirlinga",
    state: "Madhya Pradesh",
    image: "/img/omtemple.jpg",
    description: "Omkareshwar is one of India’s twelve sacred Jyotirlinga shrines dedicated to Lord Shiva.",
    temp: "19°C – 35°C",
    icon: "fa-sun"
  },
  {
    id: "baglamukhi",
    title: "Baglamukhi Mandir Nalkheda",
    state: "Madhya Pradesh",
    image: "/img/baglatemple.jpg",
    description: "A revered Siddha Peeth located on the banks of the Lakhundar River, having yellow-themed rituals.",
    temp: "22°C – 40°C",
    icon: "fa-sun"
  },
  {
    id: "sanwariya",
    title: "Sanwariya Seth",
    state: "Rajasthan",
    image: "/img/sawariyatemple.jpg",
    description: "Lord Krishna, who is worshipped here as a 'divine businessman' believed to bring prosperity and fulfill the wishes of his devotees.",
    temp: "22°C – 42°C",
    icon: "fa-leaf"
  },
  {
    id: "khatu",
    title: "Khatu Shyam",
    state: "Rajasthan",
    image: "/img/khatutemple.jpg",
    description: "Lord Krishna, worshipped as the 'Hare Ka Sahara' and believed to grant divine peace to devotees.",
    temp: "19°C – 42°C",
    icon: "fa-mountain"
  },
  {
    id: "jaipur",
    title: "Jaipur",
    state: "Rajasthan",
    image: "/img/jaipur.jpg",
    description: "The Pink City dazzles with majestic forts, royal palaces, and vibrant bazaars at every turn.",
    temp: "18°C – 40°C",
    icon: "fa-water"
  },
  {
    id: "udaipur",
    title: "Udaipur",
    state: "Rajasthan",
    image: "/img/udaipur.jpg",
    description: "City of Lakes — floating palaces, romantic sunsets, and timeless Rajputana architecture.",
    temp: "19°C – 41°C",
    icon: "fa-droplet"
  },
  {
    id: "rishikesh",
    title: "Rishikesh",
    state: "Uttarakhand",
    image: "/img/rishikesh.jpg",
    description: "Yoga capital of the world — Ganges ghats, white-water rafting, and spiritual serenity.",
    temp: "26°C – 35°C",
    icon: "fa-snowflake"
  }
];

export default function Destinations() {
  const [showAll, setShowAll] = useState(false);

  const scrollToBook = () => {
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const visibleDestinations = showAll ? destinationsData : destinationsData.slice(0, 4);

  return (
    <section id="destinations" className="section">
      <div className="section-header">
        <p className="section-label">Where do you want to go?</p>
        <h2 className="section-title">Popular <em>Destinations</em></h2>
        <p className="section-desc">Eight iconic Indian escapes — handpicked for their beauty, culture, and adventure.</p>
      </div>

      <div className="dest-grid">
        {visibleDestinations.map((dest, idx) => (
          <div className="dest-card" key={dest.id} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="dest-img-wrap">
              <img src={dest.image} alt={dest.title} loading="lazy" />
              <div className="dest-overlay"></div>
              <span className="dest-tag">{dest.state}</span>
            </div>
            <div className="dest-body">
              <h3>{dest.title}</h3>
              <p>{dest.description}</p>
              <div className="dest-footer">
                <span><i className={`fa-solid ${dest.icon}`}></i> {dest.temp}</span>
                <button className="dest-btn" onClick={scrollToBook}>
                  Explore <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <button
          className="btn-ghost"
          onClick={() => setShowAll((prev) => !prev)}
          style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}
        >
          <span>{showAll ? "Show Less Destinations" : "See All Destinations (8)"}</span>
          <i className={`fa-solid ${showAll ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
        </button>
      </div>
    </section>
  );
}

import React, { useState } from "react";

const carsData = [
  {
    id: "swift",
    name: "Maruti Swift",
    desc: "Perfect for city rides and short trips. Fuel-efficient and agile.",
    price: "₹11",
    unit: "/km (AC)",
    image: "/img/swifttcar.jpg"
  },
  {
    id: "dzire",
    name: "Maruti Dzire",
    desc: "Elegant sedan with spacious interiors — ideal for family outings.",
    price: "₹11",
    unit: "/km (AC)",
    image: "/img/dzsirecar.jpg"
  },
  {
    id: "i20",
    name: "Hyundai I20 (diesel)",
    desc: "A premium 5-seater hatchback known for its stylish design.",
    price: "₹14",
    unit: "/km (AC)",
    image: "/img/i20car.jpg"
  },
  {
    id: "aura",
    name: "Hyundai Aura",
    desc: "A stylish, feature-packed subcompact sedan designed car",
    price: "₹11",
    unit: "/km (AC)",
    image: "/img/auraxar.jpg"
  },
  {
    id: "amaze",
    name: "Honda Amaze",
    desc: "Compact sedan, 420-litre boot capacity, and comfortable ride.",
    price: "₹14",
    unit: "/km (AC)",
    image: "/img/amazecarr.jpg"
  },
  {
    id: "ertiga",
    name: "Maruti Ertiga",
    desc: "7-seater MPV with excellent fuel efficiency for long family drives.",
    price: "₹13",
    unit: "/km (AC)",
    image: "/img/ertiga.jpg"
  },
  {
    id: "crysta",
    name: "Innova Crysta",
    desc: "Rugged and powerful — built to handle every Indian road condition.",
    price: "₹19",
    unit: "/km (AC)",
    image: "/img/crystacar.jpg"
  },
  {
    id: "carens",
    name: "Kia Carens",
    desc: "Modern 7-seater MPV with plush interiors and panoramic sunroof.",
    price: "₹15",
    unit: "/km (AC)",
    image: "/img/kiacar.jpg"
  },
  {
    id: "toofan",
    name: "Force Toofan",
    desc: "A robust 11+D seater multi-utility vehicle (MUV).",
    price: "₹17",
    unit: "/km (AC)",
    image: "/img/toofancar.jpg"
  },
  {
    id: "traveller",
    name: "Traveller 15/22 seater",
    desc: "A versatile light commercial vehicle (LCV) and minibus.",
    price: "₹25/28",
    unit: "/km (AC)",
    image: "/img/traveller.jpg"
  }
];

export default function Fleet() {
  const [showAll, setShowAll] = useState(false);

  const scrollToBook = (carName) => {
    const el = document.getElementById("book");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const selectEl = document.getElementById("cartype");
      if (selectEl) {
        const optionToSelect = Array.from(selectEl.options).find(opt => opt.text.toLowerCase().includes(carName.split(' ')[1]?.toLowerCase() || carName.toLowerCase()));
        if (optionToSelect) {
          selectEl.value = optionToSelect.value;
        }
      }
    }
  };

  const visibleCars = showAll ? carsData : carsData.slice(0, 4);

  return (
    <section id="cars" className="section section-dark">
      <div className="section-header">
        <p className="section-label">Travel in comfort</p>
        <h2 className="section-title">Our Premium <em>Fleet</em></h2>
        <p className="section-desc">Clean, well-maintained vehicles driven by professional, verified drivers.</p>
      </div>

      <div className="cars-grid">
        {visibleCars.map((car) => (
          <div className="car-card" key={car.id}>
            <div className="car-img-wrap">
              <img src={car.image} alt={car.name} loading="lazy" />
              <div className="car-glow"></div>
            </div>
            <div className="car-body">
              <h3>{car.name}</h3>
              <p>{car.desc}</p>
              <div className="car-price">
                <span className="price-tag">{car.price}<small>{car.unit}</small></span>
                <button className="car-btn" onClick={() => scrollToBook(car.name)}>
                  Book <i className="fa-solid fa-chevron-right"></i>
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
          <span>{showAll ? "Show Less Fleet" : "See All Vehicles (10)"}</span>
          <i className={`fa-solid ${showAll ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
        </button>
      </div>
    </section>
  );
}

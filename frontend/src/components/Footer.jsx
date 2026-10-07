import React from "react";

export default function Footer({ setCurrentView }) {
  const scrollToSection = (sectionId) => {
    setCurrentView("home");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <footer id="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/img/logo.jpg" alt="Shree Sanwariya Travels Logo" className="logo-icon" />
            <div>
              <span className="logo-main">Shree Sanwariya</span>
              <span className="logo-sub">Travels</span>
            </div>
          </div>
          <p>
            India's trusted travel partner since 2016. We connect hearts to destinations — safely, comfortably, and affordably.
          </p>
          <div className="social-links">
            <a
              href="https://share.google/A1sDrLro2O0M4fKsX"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Business Profile"
              title="Google Business Profile"
            >
              <i className="fa-brands fa-google"></i>
            </a>
            <a
              href="https://www.instagram.com/shreesanwariyatravels0713?igsh=MTQyb3c4OG5pdHkxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://wa.me/919893330713"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><button onClick={() => scrollToSection("hero")}>Home</button></li>
            <li><button onClick={() => scrollToSection("destinations")}>Destinations</button></li>
            <li><button onClick={() => scrollToSection("cars")}>Our Fleet</button></li>
            <li><button onClick={() => scrollToSection("reviews")}>Reviews</button></li>
            <li><button onClick={() => scrollToSection("book")}>Book Now</button></li>
            <li><button onClick={() => setCurrentView("admin")}>Admin Portal</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Popular Routes</h4>
          <ul>
            <li><button onClick={() => scrollToSection("book")}>Ujjain → Sanwariya Seth</button></li>
            <li><button onClick={() => scrollToSection("book")}>Ujjain → Khatu Shyam</button></li>
            <li><button onClick={() => scrollToSection("book")}>Ujjain → Rajasthan</button></li>
            <li><button onClick={() => scrollToSection("book")}>Indore → Mumbai</button></li>
            <li><button onClick={() => scrollToSection("book")}>Indore → Rishikesh</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="contact-list">
            <li>
              <i className="fa-solid fa-phone"></i>
              <a href="tel:+919893330713">+91 98933 30713</a>
            </li>
            <li>
              <i className="fa-solid fa-envelope"></i>
              <a href="mailto:shreesanwariyatravels0713@gmail.com">
                shreesanwariyatravels0713@gmail.com
              </a>
            </li>
            <li>
              <i className="fa-solid fa-location-dot"></i>
              <span>H35 Hatkeshwar vihar, Nanakheda, Ujjain, MP – 456001</span>
            </li>
            <li>
              <i className="fa-solid fa-clock"></i>
              <span>Open 24 hours, 7 days a week</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2025 Shree Sanwariya Travels. All rights reserved. Developed by{" "}
          <a
            href="https://www.linkedin.com/in/rajvansh-singh-atal-2b9635229"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--gold-light)", fontWeight: 600 }}
          >
            <i className="fa-brands fa-linkedin"></i> Rajvansh Singh Atal
          </a>
          , India.
        </p>
        <div className="footer-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <a href="#refund" onClick={(e) => e.preventDefault()}>Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}

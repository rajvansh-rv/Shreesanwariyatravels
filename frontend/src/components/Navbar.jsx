import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ currentView, setCurrentView, onOpenAuthModal, onOpenCustomerDashboard }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      if (currentView === "home") {
        const sections = ["hero", "destinations", "cars", "reviews", "book"];
        const current = sections.find((sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) {
            const rect = el.getBoundingClientRect();
            return rect.top <= 150 && rect.bottom >= 150;
          }
          return false;
        });
        if (current) {
          setActiveSection(current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  const handleNavClick = (sectionId) => {
    setMenuOpen(false);
    if (currentView !== "home") {
      setCurrentView("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav id="navbar" className={scrolled ? "scrolled" : ""}>
      <div className="nav-logo" onClick={() => handleNavClick("hero")}>
        <img src="/img/logo.jpg" alt="Shree Sanwariya Travels Logo" className="logo-icon" />
        <div>
          <span className="logo-main">Shree Sanwariya</span>
          <span className="logo-sub">Travels</span>
        </div>
      </div>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`} id="navLinks">
        <li>
          <button
            className={`nav-link ${activeSection === "hero" && currentView === "home" ? "active-link" : ""}`}
            onClick={() => handleNavClick("hero")}
          >
            Home
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${activeSection === "destinations" && currentView === "home" ? "active-link" : ""}`}
            onClick={() => handleNavClick("destinations")}
          >
            Destinations
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${activeSection === "cars" && currentView === "home" ? "active-link" : ""}`}
            onClick={() => handleNavClick("cars")}
          >
            Fleet
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${activeSection === "reviews" && currentView === "home" ? "active-link" : ""}`}
            onClick={() => handleNavClick("reviews")}
          >
            Reviews
          </button>
        </li>

        {/* Dynamic Auth Button replacing standalone Admin button */}
        <li>
          {!isAuthenticated ? (
            <button
              className="nav-link"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuthModal();
              }}
            >
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: "4px" }}></i> Login
            </button>
          ) : isAdmin ? (
            <button
              className={`nav-link ${currentView === "admin" ? "active-link" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                setCurrentView("admin");
              }}
            >
              <i className="fa-solid fa-gauge" style={{ marginRight: "4px" }}></i> Admin
            </button>
          ) : (
            <button
              className="nav-link"
              onClick={() => {
                setMenuOpen(false);
                onOpenCustomerDashboard();
              }}
            >
              <i className="fa-solid fa-user" style={{ marginRight: "4px" }}></i> My Account
            </button>
          )}
        </li>

        <li>
          <button
            className="nav-link nav-cta"
            onClick={() => handleNavClick("book")}
          >
            Book Now
          </button>
        </li>
      </ul>

      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        id="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle Navigation Menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
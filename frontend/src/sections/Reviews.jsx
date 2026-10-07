import React, { useState, useEffect, useRef } from "react";
import { fetchReviewSummary, fetchFeaturedReviews } from "../services/api";

export default function Reviews({ onOpenWriteReview }) {
  const [summary, setSummary] = useState({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    loadReviewData();
  }, []);

  const loadReviewData = async () => {
    try {
      const [sumData, featData] = await Promise.all([
        fetchReviewSummary(),
        fetchFeaturedReviews(10)
      ]);
      if (sumData) setSummary(sumData);
      if (featData) setFeaturedReviews(featData);
    } catch (err) {
      console.error("Failed to load reviews data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carousel Autoplay (5s interval)
  useEffect(() => {
    if (featuredReviews.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredReviews.length, isPaused]);

  const handleNext = () => {
    if (featuredReviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredReviews.length);
  };

  const handlePrev = () => {
    if (featuredReviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredReviews.length) % featuredReviews.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <section id="reviews" className="section" style={{ background: "#ffffff", padding: "5rem 1rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p className="section-label" style={{ color: "#d4af37", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
            Authentic Customer Feedback
          </p>
          <h2 className="section-title" style={{ fontSize: "2.4rem", color: "#0f172a" }}>
            What Our Travellers <em>Say</em>
          </h2>
          <p style={{ color: "#64748b", maxWidth: "600px", margin: "0.5rem auto 0 auto", fontSize: "0.95rem" }}>
            Real reviews from real passengers travelling across Madhya Pradesh and across India with Shree Sanwariya Travels.
          </p>
        </div>

        {/* Rating Summary Card (Google Review Style) */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            padding: "2.5rem 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            marginBottom: "4rem"
          }}
        >
          {/* Left Column: Big Average Score */}
          <div style={{ textAlign: "center", borderRight: "1px solid #e2e8f0", paddingRight: "1rem" }}>
            <span style={{ fontSize: "3.8rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "5.0"}
            </span>
            <div style={{ color: "#eab308", fontSize: "1.4rem", margin: "0.6rem 0" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className={`fa-solid fa-star${
                    i < Math.round(summary.averageRating) ? "" : " fa-regular"
                  }`}
                  style={{ marginRight: "3px" }}
                ></i>
              ))}
            </div>
            <p style={{ margin: "0 0 1.2rem 0", color: "#64748b", fontSize: "0.95rem", fontWeight: 600 }}>
              Based on {summary.totalReviews} verified review{summary.totalReviews === 1 ? "" : "s"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <button
                onClick={onOpenWriteReview}
                className="btn-submit"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  fontSize: "0.9rem",
                  borderRadius: "30px",
                  cursor: "pointer"
                }}
              >
                <i className="fa-solid fa-pen-to-square"></i> Write a Review
              </button>
              <a
                href="https://share.google/A1sDrLro2O0M4fKsX"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  color: "#1e40af",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
                title="View Shree Sanwariya Travels on Google Business Profile"
              >
                <i className="fa-brands fa-google" style={{ color: "#ea4335" }}></i> View on Google
              </a>
            </div>
          </div>

          {/* Right Column: Star Distribution Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.percentages[star] || 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem" }}>
                  <span style={{ width: "45px", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
                    {star} <i className="fa-solid fa-star" style={{ color: "#eab308", fontSize: "0.8rem" }}></i>
                  </span>
                  {/* Progress Track */}
                  <div style={{ flex: 1, height: "10px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: star >= 4 ? "#eab308" : star === 3 ? "#facc15" : "#f87171",
                        borderRadius: "10px",
                        transition: "width 0.6s ease"
                      }}
                    ></div>
                  </div>
                  <span style={{ width: "40px", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: "0.82rem" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Traveller Experiences Sub-header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.6rem", color: "#0f172a", margin: 0 }}>
            Featured Traveller Experiences
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "4px" }}>
            Verified customer journeys curated by our team.
          </p>
        </div>

        {/* Featured Carousel */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p style={{ marginTop: "0.5rem" }}>Loading traveller experiences...</p>
          </div>
        ) : featuredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <i className="fa-solid fa-comment-dots" style={{ fontSize: "2.5rem", color: "#cbd5e1", marginBottom: "0.8rem" }}></i>
            <h4 style={{ margin: 0, color: "#334155" }}>Be the First to Feature Your Review!</h4>
            <p style={{ color: "#64748b", fontSize: "0.88rem", maxWidth: "450px", margin: "6px auto 1.2rem auto" }}>
              Submit a review for your recent trip with Shree Sanwariya Travels and get featured on our official homepage.
            </p>
            <button
              onClick={onOpenWriteReview}
              className="btn-submit"
              style={{ padding: "8px 20px", fontSize: "0.85rem", display: "inline-block" }}
            >
              Share Your Story
            </button>
          </div>
        ) : (
          <div
            className="reviews-slider-wrap"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ position: "relative", maxWidth: "780px", margin: "0 auto" }}
          >
            <div className="reviews-slider">
              {featuredReviews.map((item, index) => (
                <div
                  key={item._id}
                  className={`review-card ${index === currentIndex ? "active" : ""}`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "2rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    display: index === currentIndex ? "block" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #d4af37, #f59e0b)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "1.1rem"
                        }}
                      >
                        {getInitials(item.customerName)}
                      </div>
                      <div>
                        <strong style={{ fontSize: "1.05rem", color: "#0f172a", display: "block" }}>
                          {item.customerName}
                        </strong>
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          <i className="fa-solid fa-location-dot" style={{ color: "#d4af37", marginRight: "3px" }}></i>
                          {item.pickup} &rarr; {item.destination}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px" }}>
                      Trip: {item.travelDate}
                    </span>
                  </div>

                  {/* Stars */}
                  <div style={{ color: "#eab308", fontSize: "1.1rem", marginBottom: "0.8rem" }}>
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <i
                        key={sIdx}
                        className={`fa-${sIdx < item.rating ? "solid" : "regular"} fa-star`}
                        style={{ marginRight: "2px" }}
                      ></i>
                    ))}
                  </div>

                  {/* Comment */}
                  <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
                    "{item.comment}"
                  </p>
                </div>
              ))}
            </div>

            {/* Slider Navigation Controls */}
            {featuredReviews.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1.2rem",
                  marginTop: "1.5rem"
                }}
              >
                <button
                  onClick={handlePrev}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                  }}
                  aria-label="Previous Review"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Dot Indicators */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {featuredReviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        width: idx === currentIndex ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        border: "none",
                        background: idx === currentIndex ? "#d4af37" : "#cbd5e1",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      aria-label={`Go to review ${idx + 1}`}
                    ></button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                  }}
                  aria-label="Next Review"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

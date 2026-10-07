import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchEligibleBookings, submitCustomerReview } from "../services/api";

export default function ReviewFormModal({ isOpen, onClose, onReviewSubmitted, onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();

  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        // Will prompt login
      } else {
        loadEligible();
      }
    }
  }, [isOpen, isAuthenticated]);

  const loadEligible = async () => {
    setLoadingBookings(true);
    setErrorMsg("");
    try {
      const list = await fetchEligibleBookings();
      setEligibleBookings(list || []);
      if (list && list.length > 0) {
        setSelectedBookingId(list[0]._id);
      }
    } catch (err) {
      console.error("Failed to load eligible bookings:", err);
      setErrorMsg("Failed to load your trip list. Please try again.");
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedBookingId) {
      setErrorMsg("Please select a trip to review.");
      return;
    }

    if (comment.trim().length < 5) {
      setErrorMsg("Review comment must be at least 5 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCustomerReview({
        bookingId: selectedBookingId,
        rating,
        comment: comment.trim()
      });

      setSuccessMsg(res.message || "Thank you! Your review has been submitted and is awaiting approval.");
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        onClose();
        setComment("");
        setRating(5);
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // 1. If user is guest / not logged in
  if (!isAuthenticated) {
    return (
      <div className="popup-overlay show" style={{ zIndex: 10000 }}>
        <div
          className="popup-box"
          style={{
            maxWidth: "440px",
            width: "90%",
            padding: "2.5rem 2rem",
            borderRadius: "16px",
            background: "#ffffff",
            color: "#0f172a",
            textAlign: "center"
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
              color: "#64748b"
            }}
          >
            &times;
          </button>
          <div style={{ fontSize: "3rem", color: "#d4af37", marginBottom: "0.8rem" }}>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a" }}>Share Your Experience</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Please login or create an account to submit an authentic review for your trip.
          </p>
          <button
            onClick={() => {
              onClose();
              if (onOpenAuthModal) onOpenAuthModal();
            }}
            className="btn-submit"
            style={{ width: "100%" }}
          >
            <i className="fa-solid fa-right-to-bracket"></i> Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay show" style={{ zIndex: 10000 }}>
      <div
        className="popup-box"
        style={{
          maxWidth: "520px",
          width: "92%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          borderRadius: "16px",
          background: "#ffffff",
          color: "#0f172a",
          textAlign: "left"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#64748b"
          }}
        >
          &times;
        </button>

        <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.35rem", color: "#0f172a" }}>
          ⭐ Write a Review
        </h3>
        <p style={{ margin: "0 0 1.2rem 0", fontSize: "0.85rem", color: "#64748b" }}>
          Reviewing as <strong>{user?.name}</strong>
        </p>

        {errorMsg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.6rem 0.8rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            ❌ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "0.8rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem", fontWeight: 600 }}>
            🎉 {successMsg}
          </div>
        )}

        {loadingBookings ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p style={{ marginTop: "0.5rem" }}>Loading your trips...</p>
          </div>
        ) : eligibleBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <i className="fa-solid fa-car-side" style={{ fontSize: "2rem", color: "#94a3b8", marginBottom: "0.5rem" }}></i>
            <h4 style={{ margin: "0 0 0.3rem 0", color: "#334155" }}>No Unreviewed Trips Found</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              You either haven't made a booking yet, or you have already reviewed all your past trips!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Trip Selection */}
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                Select Your Trip <span>*</span>
              </label>
              <div className="input-wrap">
                <i className="fa-solid fa-map-location-dot"></i>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "none", outline: "none", fontSize: "0.9rem" }}
                  required
                >
                  {eligibleBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.pickup} → {b.destination} ({b.date}) • {b.carType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Star Rating Selector */}
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                Your Rating <span>*</span>
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.8rem",
                        cursor: "pointer",
                        color: isFilled ? "#eab308" : "#cbd5e1",
                        padding: "2px",
                        transition: "transform 0.15s ease",
                        outline: "none"
                      }}
                      aria-label={`${star} Stars`}
                    >
                      <i className={isFilled ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                    </button>
                  );
                })}
                <span style={{ marginLeft: "10px", fontWeight: 700, color: "#eab308", fontSize: "1.1rem" }}>
                  {rating}.0
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                  Your Experience / Review <span>*</span>
                </label>
                <span style={{ fontSize: "0.78rem", color: comment.length > 900 ? "#ef4444" : "#94a3b8" }}>
                  {comment.length}/1000
                </span>
              </div>
              <div className="input-wrap textarea-wrap">
                <i className="fa-solid fa-pen-to-square"></i>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the driver punctuality, vehicle comfort, route experience, etc..."
                  required
                  maxLength="1000"
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              <span>{submitting ? "Submitting..." : "Submit Review for Approval"}</span>
              {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

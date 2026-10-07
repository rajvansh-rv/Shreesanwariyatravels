import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchCustomerBookings, updateUserProfile, fetchMyReviews } from "../services/api";

export default function CustomerDashboardModal({ isOpen, onClose, onOpenWriteReview }) {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("bookings"); // 'bookings' | 'reviews' | 'profile'

  // Edit profile state
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      loadBookings();
      loadReviews();
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [isOpen, user]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchCustomerBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to load customer bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await fetchMyReviews();
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to load customer reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setUpdatingProfile(true);

    try {
      await updateUserProfile({ name: editName, phone: editPhone });
      setMsg("Profile updated successfully!");
    } catch (error) {
      setErr(error.message || "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (!isOpen || !user) return null;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Confirmed":
      case "Approved":
        return { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" };
      case "Completed":
        return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" };
      case "Cancelled":
      case "Rejected":
        return { background: "#ffe4e6", color: "#be123c", border: "1px solid #fca5a5" };
      default:
        return { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
    }
  };

  return (
    <div className="popup-overlay show" style={{ zIndex: 10000 }}>
      <div
        className="popup-box"
        style={{
          maxWidth: "720px",
          width: "92%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "2rem",
          borderRadius: "16px",
          background: "#ffffff",
          color: "#0f172a",
          boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
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
          aria-label="Close dashboard"
        >
          &times;
        </button>

        {/* User Info Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", pb: "1rem", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.3rem", color: "#0f172a" }}>👋 Welcome, {user.name}</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              <i className="fa-solid fa-envelope"></i> {user.email} &nbsp;|&nbsp; <i className="fa-solid fa-phone"></i> {user.phone}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              padding: "6px 12px",
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1.2rem" }}>
          <button
            onClick={() => setActiveSubTab("bookings")}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              background: activeSubTab === "bookings" ? "#d4af37" : "#f1f5f9",
              color: activeSubTab === "bookings" ? "#ffffff" : "#475569"
            }}
          >
            <i className="fa-solid fa-clock-history"></i> My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("reviews")}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              background: activeSubTab === "reviews" ? "#d4af37" : "#f1f5f9",
              color: activeSubTab === "reviews" ? "#ffffff" : "#475569"
            }}
          >
            <i className="fa-solid fa-star"></i> My Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSubTab("profile")}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              background: activeSubTab === "profile" ? "#d4af37" : "#f1f5f9",
              color: activeSubTab === "profile" ? "#ffffff" : "#475569"
            }}
          >
            <i className="fa-solid fa-user-gear"></i> Profile Settings
          </button>
        </div>

        {/* 1. BOOKINGS HISTORY TAB */}
        {activeSubTab === "bookings" && (
          <div>
            {loadingBookings ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p>Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <i className="fa-solid fa-car-side" style={{ fontSize: "2.5rem", color: "#cbd5e1", marginBottom: "0.8rem" }}></i>
                <h4 style={{ margin: 0, color: "#334155" }}>No Bookings Found</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>You haven't made any trip requests yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                        <i className="fa-solid fa-location-dot" style={{ color: "#d4af37" }}></i> {typeof b.pickup === "object" && b.pickup ? b.pickup.address : (b.pickup || "N/A")} &rarr; {b.destination}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          ...getStatusBadgeStyle(b.status)
                        }}
                      >
                        {b.status || "Pending"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.83rem", color: "#475569" }}>
                      <span><i className="fa-solid fa-calendar"></i> Travel: <strong>{b.date || b.tdate}</strong></span>
                      <span><i className="fa-solid fa-car"></i> Vehicle: <strong>{b.carType || b.car || "Any"}</strong></span>
                      <span><i className="fa-solid fa-clock"></i> Placed: {new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>

                    {(b.message || b.request) && (
                      <div style={{ fontSize: "0.8rem", color: "#64748b", background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                        💬 <em>{b.message || b.request}</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. REVIEWS TAB (PHASE 7) */}
        {activeSubTab === "reviews" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Reviews submitted for your completed & confirmed trips.
              </p>
              {onOpenWriteReview && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWriteReview();
                  }}
                  style={{
                    padding: "6px 12px",
                    background: "#d4af37",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i> Write Review
                </button>
              )}
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p>Loading your reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <i className="fa-solid fa-star-half-stroke" style={{ fontSize: "2.5rem", color: "#cbd5e1", marginBottom: "0.8rem" }}></i>
                <h4 style={{ margin: 0, color: "#334155" }}>No Reviews Submitted Yet</h4>
                <p style={{ margin: "4px 0 1rem 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Have you travelled with us recently? Share your experience!
                </p>
                {onOpenWriteReview && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWriteReview();
                    }}
                    className="btn-primary"
                    style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                          <i className="fa-solid fa-location-dot" style={{ color: "#d4af37" }}></i> {r.pickup} &rarr; {r.destination}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "8px" }}>
                          ({r.travelDate})
                        </span>
                      </div>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          ...getStatusBadgeStyle(r.status)
                        }}
                      >
                        Status: {r.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#eab308", fontSize: "0.9rem" }}>
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <i
                          key={sIdx}
                          className={`fa-${sIdx < r.rating ? "solid" : "regular"} fa-star`}
                        ></i>
                      ))}
                      <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "6px" }}>
                        Submitted {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#334155", fontStyle: "italic", background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. PROFILE EDIT TAB */}
        {activeSubTab === "profile" && (
          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {msg && <div style={{ background: "#f0fdf4", color: "#166534", padding: "0.6rem", borderRadius: "6px", fontSize: "0.85rem" }}>✅ {msg}</div>}
            {err && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.6rem", borderRadius: "6px", fontSize: "0.85rem" }}>❌ {err}</div>}

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Full Name</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user"></i>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Phone Number</label>
              <div className="input-wrap">
                <i className="fa-solid fa-phone"></i>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Email Address (Read-only)</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input type="email" value={user.email} disabled style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={updatingProfile} style={{ marginTop: "0.5rem" }}>
              <span>{updatingProfile ? "Saving..." : "Save Profile Updates"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

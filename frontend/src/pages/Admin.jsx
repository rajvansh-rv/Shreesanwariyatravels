import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  loginUser,
  fetchAdminStats,
  fetchAdminBookings,
  updateBookingStatus,
  deleteBooking,
  exportBookingsCSV,
  adminFetchReviews,
  adminUpdateReviewStatus,
  adminToggleFeaturedReview,
  adminDeleteReview
} from "../services/api";

export default function Admin() {
  const { user, token, login, logout, isAdmin } = useAuth();

  // Active top-level admin tab: 'bookings' | 'reviews'
  const [adminSection, setAdminSection] = useState("bookings");

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Bookings Data State
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalCustomers: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Reviews Data State
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
    featuredReviews: 0
  });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Booking Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Review Filters
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("All");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("All");
  const [reviewSortBy, setReviewSortBy] = useState("newest");
  // Ensure search engines do not index the admin portal
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Admin Portal | Shree Sanwariya Travels";

    let robotsMeta = document.querySelector('meta[name="robots"]');
    const prevRobots = robotsMeta ? robotsMeta.getAttribute("content") : null;

    if (robotsMeta) {
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      robotsMeta.setAttribute("content", "noindex, nofollow");
      document.head.appendChild(robotsMeta);
    }

    return () => {
      document.title = prevTitle || "Shree Sanwariya Travels | Taxi & Tour Services in Ujjain";
      if (robotsMeta) {
        if (prevRobots) {
          robotsMeta.setAttribute("content", prevRobots);
        } else {
          robotsMeta.setAttribute("content", "index, follow");
        }
      }
    };
  }, []);

  useEffect(() => {
    if (token && isAdmin) {
      if (adminSection === "bookings") {
        loadBookingsData();
      } else {
        loadReviewsData();
      }
    }
  }, [
    token,
    isAdmin,
    adminSection,
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    reviewSearch,
    reviewStatusFilter,
    reviewRatingFilter,
    reviewSortBy
  ]);

  const loadBookingsData = async () => {
    setLoadingBookings(true);
    setErrorMsg("");
    try {
      const statsData = await fetchAdminStats();
      if (statsData) setStats(statsData);

      const bookingsData = await fetchAdminBookings({
        search: searchTerm,
        status: statusFilter,
        dateFilter,
        sortBy
      });
      setBookings(bookingsData || []);
    } catch (err) {
      setErrorMsg(err.message || "Failed to load bookings");
      if (err.message.includes("Access denied") || err.message.includes("Invalid")) {
        logout();
      }
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadReviewsData = async () => {
    setLoadingReviews(true);
    setErrorMsg("");
    try {
      const res = await adminFetchReviews({
        status: reviewStatusFilter,
        rating: reviewRatingFilter,
        search: reviewSearch,
        sortBy: reviewSortBy
      });
      if (res.stats) setReviewStats(res.stats);
      setReviews(res.reviews || []);
    } catch (err) {
      setErrorMsg(err.message || "Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await loginUser({ email: username, password });
      if (res.success && res.token) {
        login(res.token, res.user);
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setLoginError(err.message || "Invalid credentials");
    }
  };

  // Booking handlers
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      showToast(`Booking status updated to ${newStatus}`);
      loadBookingsData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking permanently?")) {
      return;
    }
    try {
      await deleteBooking(id);
      showToast("Booking deleted successfully");
      loadBookingsData();
    } catch (err) {
      alert("Failed to delete booking: " + err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast("Generating CSV export...");
      await exportBookingsCSV({
        search: searchTerm,
        status: statusFilter,
        dateFilter
      });
      showToast("CSV file downloaded successfully!");
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  // Review handlers
  const handleReviewStatusChange = async (id, newStatus) => {
    try {
      await adminUpdateReviewStatus(id, newStatus);
      showToast(`Review status set to ${newStatus}`);
      loadReviewsData();
    } catch (err) {
      alert("Failed to update review status: " + err.message);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured, status) => {
    if (!currentFeatured && status !== "Approved") {
      alert("Please approve this review before marking it as featured on homepage.");
      return;
    }
    try {
      await adminToggleFeaturedReview(id, !currentFeatured);
      showToast(!currentFeatured ? "Review added to Homepage Carousel!" : "Review removed from Homepage Carousel");
      loadReviewsData();
    } catch (err) {
      alert("Failed to toggle featured status: " + err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review permanently?")) {
      return;
    }
    try {
      await adminDeleteReview(id);
      showToast("Review deleted successfully");
      loadReviewsData();
    } catch (err) {
      alert("Failed to delete review: " + err.message);
    }
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // 1. UNAUTHENTICATED / NOT ADMIN VIEW
  if (!token || !isAdmin) {
    return (
      <div className="admin-container" style={{ padding: "4rem 1rem", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className="admin-login-box"
          style={{
            maxWidth: "420px",
            width: "100%",
            background: "#ffffff",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0"
          }}
        >
          <h2 style={{ textAlign: "center", margin: "0 0 1.5rem 0", color: "#0f172a" }}>🛡️ Admin Dashboard</h2>
          {loginError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.6rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", textAlign: "center" }}>
              ❌ {loginError}
            </div>
          )}
          <form onSubmit={handleAdminLogin}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label htmlFor="adminUsername" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Admin Username / Email</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="adminUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.2rem" }}>
              <label htmlFor="adminPassword" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="adminPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" style={{ width: "100%", background: "#0f172a" }}>
              <i className="fa-solid fa-right-to-bracket"></i> Login Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD VIEW
  return (
    <div className="admin-container" style={{ padding: "2rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Toast Feedback */}
      {toastMsg && (
        <div style={{ position: "fixed", top: "80px", right: "20px", background: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 10000, fontSize: "0.9rem", fontWeight: 600 }}>
          ℹ️ {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#0f172a" }}>Admin Management Portal</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>Shree Sanwariya Travels • MongoDB Atlas Administration</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {adminSection === "bookings" && (
            <button
              onClick={handleExportCSV}
              style={{
                padding: "8px 16px",
                background: "#166534",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <i className="fa-solid fa-file-csv"></i> Export CSV
            </button>
          )}
          <button
            onClick={logout}
            style={{
              padding: "8px 16px",
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>

      {/* Admin Section Tabs (Bookings vs Reviews) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setAdminSection("bookings")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            background: adminSection === "bookings" ? "#0f172a" : "#e2e8f0",
            color: adminSection === "bookings" ? "#ffffff" : "#475569",
            transition: "all 0.2s ease"
          }}
        >
          <i className="fa-solid fa-car"></i> Bookings Management ({stats.totalBookings})
        </button>
        <button
          onClick={() => setAdminSection("reviews")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            background: adminSection === "reviews" ? "#d4af37" : "#e2e8f0",
            color: adminSection === "reviews" ? "#ffffff" : "#475569",
            transition: "all 0.2s ease"
          }}
        >
          <i className="fa-solid fa-star"></i> Reviews Moderation ({reviewStats.totalReviews})
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          ❌ {errorMsg}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: BOOKINGS MANAGEMENT                                */}
      {/* ============================================================ */}
      {adminSection === "bookings" && (
        <>
          {/* Booking Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            <div style={{ background: "#ffffff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>TOTAL BOOKINGS</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#0f172a" }}>{stats.totalBookings}</h2>
            </div>
            <div style={{ background: "#fef3c7", padding: "1.2rem", borderRadius: "12px", border: "1px solid #fde68a" }}>
              <span style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 600 }}>PENDING</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#92400e" }}>{stats.pendingBookings}</h2>
            </div>
            <div style={{ background: "#dcfce7", padding: "1.2rem", borderRadius: "12px", border: "1px solid #86efac" }}>
              <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 600 }}>CONFIRMED</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#166534" }}>{stats.confirmedBookings}</h2>
            </div>
            <div style={{ background: "#dbeafe", padding: "1.2rem", borderRadius: "12px", border: "1px solid #93c5fd" }}>
              <span style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: 600 }}>COMPLETED</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#1e3a8a" }}>{stats.completedBookings}</h2>
            </div>
            <div style={{ background: "#ffe4e6", padding: "1.2rem", borderRadius: "12px", border: "1px solid #fca5a5" }}>
              <span style={{ fontSize: "0.8rem", color: "#be123c", fontWeight: 600 }}>CANCELLED</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#9f1239" }}>{stats.cancelledBookings}</h2>
            </div>
            <div style={{ background: "#f3e8ff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #d8b4fe" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b21a8", fontWeight: 600 }}>CUSTOMERS</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#581c87" }}>{stats.totalCustomers}</h2>
            </div>
          </div>

          {/* Booking Filters */}
          <div
            style={{
              background: "#ffffff",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            <div style={{ flex: "1 1 240px", minWidth: "220px" }}>
              <div className="input-wrap" style={{ margin: 0 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search name, phone, route..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Date:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Upcoming">Upcoming Trips</option>
                <option value="Past">Past Trips</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="newest">Newest Placed</option>
                <option value="oldest">Oldest Placed</option>
                <option value="travelDateAsc">Travel Date (Earliest)</option>
                <option value="travelDateDesc">Travel Date (Latest)</option>
                <option value="name">Customer Name</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="admin-table-wrap" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Placed</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Customer</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Phone</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Route</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Travel Date</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Vehicle</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Status (Action)</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                      <p style={{ marginTop: "0.5rem" }}>Loading bookings from MongoDB Atlas...</p>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      No bookings found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const datePlaced = b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "N/A";

                    const pickupAddr = typeof b.pickup === "object" && b.pickup ? b.pickup.address : (b.pickup || "N/A");
                    const hasCoords =
                      typeof b.pickup === "object" &&
                      b.pickup &&
                      b.pickup.latitude !== null &&
                      b.pickup.latitude !== undefined &&
                      b.pickup.longitude !== null &&
                      b.pickup.longitude !== undefined;

                    const cleanPhone = (b.phone || "").replace(/\D/g, "");
                    const waMsg = encodeURIComponent(
                      `Hello ${b.name}, regarding your booking request for ${pickupAddr} to ${b.destination} on ${b.date || b.tdate}.`
                    );

                    return (
                      <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b" }}>{datePlaced}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{b.name}</td>
                        <td style={{ padding: "12px 16px", color: "#334155" }}>{b.phone}</td>
                        <td style={{ padding: "12px 16px", color: "#0f172a" }}>
                          <div>
                            <strong>{pickupAddr}</strong> &rarr; {b.destination}
                          </div>
                          {hasCoords ? (
                            <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.74rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                                📍 {Number(b.pickup.latitude).toFixed(4)}, {Number(b.pickup.longitude).toFixed(4)}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${b.pickup.latitude},${b.pickup.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "0.74rem",
                                  color: "#1d4ed8",
                                  textDecoration: "underline",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px"
                                }}
                                title="Open exact GPS coordinates on Google Maps in a new tab"
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square"></i> View Location
                              </a>
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                              Coordinates not available
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className="badge-date" style={{ background: "#f1f5f9", color: "#0f172a", padding: "4px 8px", borderRadius: "6px", fontSize: "0.82rem" }}>
                            {b.date || b.tdate}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>{b.carType || b.car || "Any"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <select
                            value={b.status || "Pending"}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                              background:
                                b.status === "Confirmed"
                                  ? "#dcfce7"
                                  : b.status === "Completed"
                                  ? "#dbeafe"
                                  : b.status === "Cancelled"
                                  ? "#ffe4e6"
                                  : "#fef3c7",
                              color:
                                b.status === "Confirmed"
                                  ? "#15803d"
                                  : b.status === "Completed"
                                  ? "#1e40af"
                                  : b.status === "Cancelled"
                                  ? "#be123c"
                                  : "#b45309"
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div className="action-btns" style={{ display: "flex", gap: "6px" }}>
                            <a href={`tel:${b.phone}`} className="btn-admin-icon btn-admin-call" title="Call Client">
                              <i className="fa-solid fa-phone"></i>
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-admin-icon btn-admin-wa"
                              title="WhatsApp Client"
                            >
                              <i className="fa-brands fa-whatsapp"></i>
                            </a>
                            <button
                              onClick={() => handleDelete(b._id)}
                              className="btn-admin-icon btn-admin-delete"
                              title="Delete Booking"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: REVIEWS MODERATION (PHASE 8)                      */}
      {/* ============================================================ */}
      {adminSection === "reviews" && (
        <>
          {/* Review Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            <div style={{ background: "#ffffff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>TOTAL REVIEWS</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#0f172a" }}>{reviewStats.totalReviews}</h2>
            </div>
            <div style={{ background: "#dcfce7", padding: "1.2rem", borderRadius: "12px", border: "1px solid #86efac" }}>
              <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 600 }}>APPROVED</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#166534" }}>{reviewStats.approvedReviews}</h2>
            </div>
            <div style={{ background: "#fef3c7", padding: "1.2rem", borderRadius: "12px", border: "1px solid #fde68a" }}>
              <span style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 600 }}>PENDING APPROVAL</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#92400e" }}>{reviewStats.pendingReviews}</h2>
            </div>
            <div style={{ background: "#ffe4e6", padding: "1.2rem", borderRadius: "12px", border: "1px solid #fca5a5" }}>
              <span style={{ fontSize: "0.8rem", color: "#be123c", fontWeight: 600 }}>REJECTED</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#9f1239" }}>{reviewStats.rejectedReviews}</h2>
            </div>
            <div style={{ background: "#f3e8ff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #d8b4fe" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b21a8", fontWeight: 600 }}>FEATURED ON HOMEPAGE</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "#581c87" }}>{reviewStats.featuredReviews} / 10</h2>
            </div>
          </div>

          {/* Review Filters */}
          <div
            style={{
              background: "#ffffff",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            <div style={{ flex: "1 1 240px", minWidth: "220px" }}>
              <div className="input-wrap" style={{ margin: 0 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search customer, comment, route..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Status:</label>
              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="All">All Reviews</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Featured">Featured Only</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Rating:</label>
              <select
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="All">All Stars</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Sort:</label>
              <select
                value={reviewSortBy}
                onChange={(e) => setReviewSortBy(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="ratingHigh">Rating (High to Low)</option>
                <option value="ratingLow">Rating (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="admin-table-wrap" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Customer</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Trip</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Rating</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569", width: "30%" }}>Comment</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Featured</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingReviews ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                      <p style={{ marginTop: "0.5rem" }}>Loading reviews from database...</p>
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      No customer reviews found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => {
                    const dateSubmitted = r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short"
                        })
                      : "N/A";

                    return (
                      <tr key={r._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#64748b" }}>{dateSubmitted}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{r.customerName}</td>
                        <td style={{ padding: "12px 16px", color: "#334155", fontSize: "0.85rem" }}>
                          <div><strong>{r.pickup}</strong> &rarr; {r.destination}</div>
                          <small style={{ color: "#64748b" }}>Date: {r.travelDate}</small>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: "#eab308", fontWeight: 700, fontSize: "0.9rem" }}>
                            {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#334155", maxWidth: "300px" }}>
                          "{r.comment}"
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <select
                            value={r.status || "Pending"}
                            onChange={(e) => handleReviewStatusChange(r._id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                              background:
                                r.status === "Approved"
                                  ? "#dcfce7"
                                  : r.status === "Rejected"
                                  ? "#ffe4e6"
                                  : "#fef3c7",
                              color:
                                r.status === "Approved"
                                  ? "#15803d"
                                  : r.status === "Rejected"
                                  ? "#be123c"
                                  : "#b45309"
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => handleToggleFeatured(r._id, r.isFeatured, r.status)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: r.isFeatured ? "1px solid #c084fc" : "1px solid #cbd5e1",
                              background: r.isFeatured ? "#f3e8ff" : "#f8fafc",
                              color: r.isFeatured ? "#7e22ce" : "#64748b"
                            }}
                          >
                            {r.isFeatured ? "⭐ Featured" : "☆ Feature"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="btn-admin-icon btn-admin-delete"
                            title="Delete Review"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

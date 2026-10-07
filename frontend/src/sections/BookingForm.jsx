import React, { useState } from "react";
import { submitBooking } from "../services/api";

export default function BookingForm() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickup: "",
    destination: "",
    tdate: todayStr,
    cartype: "",
    message: ""
  });

  // Phase 4: Structured Geolocation State
  const [pickupLocation, setPickupLocation] = useState({
    latitude: null,
    longitude: null,
    detected: false
  });

  const [geoStatus, setGeoStatus] = useState({
    loading: false,
    message: "",
    type: "" // "success" | "error" | "info" | ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = "Please enter your full name (min 3 characters).";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.pickup || formData.pickup.trim().length < 2) {
      errs.pickup = "Please enter your pickup location address.";
    }

    if (!formData.destination || formData.destination.trim().length < 2) {
      errs.destination = "Please enter your destination.";
    }

    if (!formData.tdate) {
      errs.tdate = "Please select a valid travel date.";
    } else {
      const selected = new Date(formData.tdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.tdate = "Please select today or a future date.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }

    // If customer manually modifies pickup text after GPS detection,
    // clear coordinates so stale location is not submitted with a different address
    if (id === "pickup" && pickupLocation.latitude !== null) {
      setPickupLocation({
        latitude: null,
        longitude: null,
        detected: false
      });
      setGeoStatus({
        loading: false,
        message: "",
        type: ""
      });
    }
  };

  /**
   * Browser Native Geolocation Handler
   */
  const handleGetCurrentLocation = () => {
    if (geoStatus.loading) return;

    if (!navigator.geolocation) {
      setGeoStatus({
        loading: false,
        message: "Location is not supported by this browser.",
        type: "error"
      });
      return;
    }

    setGeoStatus({
      loading: true,
      message: "Detecting location...",
      type: "info"
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickupLocation({
          latitude,
          longitude,
          detected: true
        });
        setGeoStatus({
          loading: false,
          message: "✓ Current location detected",
          type: "success"
        });
        if (errors.pickup) {
          setErrors((prev) => ({ ...prev, pickup: "" }));
        }
      },
      (error) => {
        let errMsg = "Unable to detect your location. Please enter your pickup address manually.";
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Location permission was denied. Please enter your pickup address manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = "Unable to detect your location. Please enter your pickup address manually.";
        } else if (error.code === error.TIMEOUT) {
          errMsg = "Location request timed out. Please try again or enter your pickup address manually.";
        }
        setPickupLocation({
          latitude: null,
          longitude: null,
          detected: false
        });
        setGeoStatus({
          loading: false,
          message: errMsg,
          type: "error"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleClearCoordinates = () => {
    setPickupLocation({
      latitude: null,
      longitude: null,
      detected: false
    });
    setGeoStatus({
      loading: false,
      message: "",
      type: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Structured booking payload with pickup address & optional GPS coordinates
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pickup: {
          address: formData.pickup.trim(),
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude
        },
        destination: formData.destination.trim(),
        tdate: formData.tdate,
        cartype: formData.cartype && formData.cartype.trim() ? formData.cartype : "Any / Suggest me",
        message: formData.message.trim()
      };

      await submitBooking(payload);

      // Construct WhatsApp notification message
      const waRequest = formData.message.trim() ? formData.message : "None";
      const waCar = formData.cartype && formData.cartype.trim() ? formData.cartype : "Any / Suggest me";
      const waLocation = pickupLocation.detected
        ? `${formData.pickup.trim()} (GPS: https://www.google.com/maps?q=${pickupLocation.latitude},${pickupLocation.longitude})`
        : formData.pickup.trim();

      const waMessage = `New Booking Request:\nName: ${formData.name}\nPhone: ${formData.phone}\nPickup: ${waLocation}\nDestination: ${formData.destination}\nDate: ${formData.tdate}\nCar: ${waCar}\nRequest: ${waRequest}`;

      const waUrl = `https://wa.me/919893330713?text=${encodeURIComponent(waMessage)}`;
      const newWin = window.open(waUrl, "_blank");
      if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
        window.location.href = waUrl;
      }

      setShowPopup(true);
      setFormData({
        name: "",
        phone: "",
        pickup: "",
        destination: "",
        tdate: todayStr,
        cartype: "",
        message: ""
      });
      setPickupLocation({
        latitude: null,
        longitude: null,
        detected: false
      });
      setGeoStatus({
        loading: false,
        message: "",
        type: ""
      });
      setErrors({});
    } catch (err) {
      setSubmitError(err.message || "An error occurred while sending the booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="book" className="section">
      <div className="book-wrap">
        <div className="book-left">
          <p className="section-label">Ready to journey?</p>
          <h2 className="section-title">Book Your <em>Trip Now</em></h2>
          <p className="book-desc">
            Fill in the details and our travel expert will call you within 30 minutes to confirm your booking.
          </p>
          <ul className="book-perks">
            <li><i className="fa-solid fa-check-circle"></i> 10% Discount on 10 Days Pre-Booking</li>
            <li><i className="fa-solid fa-check-circle"></i> No booking fee</li>
            <li><i className="fa-solid fa-check-circle"></i> Free cancellation up to 24 hrs</li>
            <li><i className="fa-solid fa-check-circle"></i> Instant confirmation</li>
            <li><i className="fa-solid fa-check-circle"></i> 24/7 driver support</li>
          </ul>
          <div className="contact-chips">
            <a href="tel:+919893330713" className="chip">
              <i className="fa-solid fa-phone"></i> +91 98933 30713
            </a>
            <a
              href="https://wa.me/919893330713"
              className="chip chip-green"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>

        <div className="book-right">
          <form id="bookingForm" className="booking-form" onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div style={{ background: "#ef444422", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                ❌ {submitError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name <span>*</span></label>
              <div className={`input-wrap ${errors.name ? "error" : ""}`}>
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="off"
                />
              </div>
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number <span>*</span></label>
              <div className={`input-wrap ${errors.phone ? "error" : ""}`}>
                <i className="fa-solid fa-phone"></i>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  autoComplete="off"
                />
              </div>
              {errors.phone && <span className="err-msg">{errors.phone}</span>}
            </div>

            {/* Phase 4: Pickup Location with Geolocation */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="pickup" style={{ margin: 0 }}>
                  Pickup Location <span>*</span>
                </label>
                {pickupLocation.detected && (
                  <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <i className="fa-solid fa-satellite-dish"></i> GPS Captured
                  </span>
                )}
              </div>

              <div className={`input-wrap ${errors.pickup ? "error" : ""}`}>
                <i className="fa-solid fa-location-dot"></i>
                <input
                  type="text"
                  id="pickup"
                  value={formData.pickup}
                  onChange={handleChange}
                  placeholder="Enter pickup address, station, or landmark..."
                  autoComplete="off"
                />
              </div>
              {errors.pickup && <span className="err-msg">{errors.pickup}</span>}

              {/* Geolocation & Map Buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  id="btnCurrentLocation"
                  onClick={handleGetCurrentLocation}
                  disabled={geoStatus.loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    background: pickupLocation.detected ? "#ecfdf5" : "#f1f5f9",
                    color: pickupLocation.detected ? "#065f46" : "#334155",
                    border: pickupLocation.detected ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
                    cursor: geoStatus.loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                  title="Detect your current location using device GPS"
                >
                  {geoStatus.loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Detecting location...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-location-crosshairs" style={{ color: pickupLocation.detected ? "#10b981" : "#0284c7" }}></i>
                      {pickupLocation.detected ? "Current Location Captured" : "Use my current location"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    background: "#f8fafc",
                    color: "#94a3b8",
                    border: "1px dashed #cbd5e1",
                    cursor: "not-allowed",
                    opacity: 0.85
                  }}
                  title="Map picker coming in next update"
                >
                  <i className="fa-solid fa-map-location-dot"></i> Choose on map (Coming soon)
                </button>
              </div>

              {/* Geolocation Status Message */}
              {geoStatus.message && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background:
                      geoStatus.type === "success"
                        ? "#f0fdf4"
                        : geoStatus.type === "error"
                        ? "#fef2f2"
                        : "#f0f9ff",
                    color:
                      geoStatus.type === "success"
                        ? "#166534"
                        : geoStatus.type === "error"
                        ? "#991b1b"
                        : "#075985",
                    border:
                      geoStatus.type === "success"
                        ? "1px solid #bbf7d0"
                        : geoStatus.type === "error"
                        ? "1px solid #fecaca"
                        : "1px solid #bae6fd"
                  }}
                >
                  <span>
                    {geoStatus.type === "success" && <i className="fa-solid fa-circle-check" style={{ marginRight: "5px" }}></i>}
                    {geoStatus.type === "error" && <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "5px" }}></i>}
                    {geoStatus.type === "info" && <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "5px" }}></i>}
                    {geoStatus.message}
                    {pickupLocation.detected && (
                      <span style={{ marginLeft: "6px", opacity: 0.85, fontWeight: 500 }}>
                        (GPS: {pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)})
                      </span>
                    )}
                  </span>
                  {pickupLocation.detected && (
                    <button
                      type="button"
                      onClick={handleClearCoordinates}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        textDecoration: "underline",
                        marginLeft: "8px"
                      }}
                      title="Clear detected GPS coordinates"
                    >
                      Clear GPS
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination <span>*</span></label>
              <div className={`input-wrap ${errors.destination ? "error" : ""}`}>
                <i className="fa-solid fa-map-pin"></i>
                <input
                  type="text"
                  id="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Omkareshwar, Bhopal, Indore"
                  autoComplete="off"
                />
              </div>
              {errors.destination && <span className="err-msg">{errors.destination}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tdate">Travel Date <span>*</span></label>
                <div className={`input-wrap ${errors.tdate ? "error" : ""}`}>
                  <i className="fa-solid fa-calendar"></i>
                  <input
                    type="date"
                    id="tdate"
                    min={todayStr}
                    value={formData.tdate}
                    onChange={handleChange}
                  />
                </div>
                {errors.tdate && <span className="err-msg">{errors.tdate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cartype">Preferred Car</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-car"></i>
                  <select id="cartype" value={formData.cartype} onChange={handleChange}>
                    <option value="">Any / Suggest me</option>
                    <option value="Maruti Swift">Maruti Swift</option>
                    <option value="Maruti Dzire">Maruti Dzire</option>
                    <option value="Hyundai I20 (D)">Hyundai I20 (D)</option>
                    <option value="Hyundai Aura">Hyundai Aura</option>
                    <option value="Honda amaze">Honda amaze</option>
                    <option value="Maruti Ertiga">Maruti Ertiga</option>
                    <option value="Innova crysta">Innova crysta</option>
                    <option value="Kia Carens">Kia Carens</option>
                    <option value="Force Toofan">Force Toofan</option>
                    <option value="Traveller 15 seater">Traveller 15 seater</option>
                    <option value="Traveller 22 seater">Traveller 22 seater</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Special Requests</label>
              <div className="input-wrap textarea-wrap">
                <i className="fa-solid fa-message"></i>
                <textarea
                  id="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any special requirements, stops, or notes..."
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn-submit" id="submitBtn" disabled={loading}>
              <span className="btn-text">{loading ? "Sending..." : "Confirm My Booking"}</span>
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-paper-plane"></i>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Popup Modal */}
      <div className={`popup-overlay ${showPopup ? "show" : ""}`}>
        <div className="popup-box">
          <div className="popup-icon"><i className="fa-solid fa-circle-check"></i></div>
          <h3>Booking Request Sent! 🎉</h3>
          <p>Thank you! Our team will call you within <strong>30 minutes</strong> to confirm your booking.</p>
          <p className="popup-sub">Check WhatsApp for your trip details.</p>
          <button className="btn-primary popup-close" onClick={() => setShowPopup(false)}>
            <span>Awesome, Thanks!</span>
          </button>
        </div>
      </div>
    </section>
  );
}

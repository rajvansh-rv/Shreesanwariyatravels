import React, { useState } from "react";
import { loginUser, registerCustomer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialTab = "customerLogin" }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // customerLogin | customerSignup | adminLogin

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Admin login form state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      const res = await loginUser({ email: loginEmail, password: loginPassword });
      if (res.success && res.token) {
        login(res.token, res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    resetForm();

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerCustomer({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        confirmPassword: signupConfirmPassword
      });

      if (res.success && res.token) {
        login(res.token, res.user);
        setSuccessMsg("Account created successfully!");
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      const res = await loginUser({ email: adminUsername, password: adminPassword });
      if (res.success && res.token) {
        login(res.token, res.user);
        onClose();
        if (window.location.hash !== "#admin") {
          window.location.hash = "admin";
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay show" style={{ zIndex: 10000 }}>
      <div
        className="popup-box"
        style={{
          maxWidth: "460px",
          width: "90%",
          padding: "2rem",
          borderRadius: "16px",
          background: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          border: "1px solid #e2e8f0"
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
          aria-label="Close modal"
        >
          &times;
        </button>

        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.4rem", color: "#0f172a", textAlign: "center" }}>
          {activeTab === "customerLogin" && "🔑 Customer Login"}
          {activeTab === "customerSignup" && "✨ Create Customer Account"}
          {activeTab === "adminLogin" && "🛡️ Admin Portal Login"}
        </h3>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "8px",
            marginBottom: "1.2rem"
          }}
        >
          <button
            type="button"
            onClick={() => handleTabSwitch("customerLogin")}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              background: activeTab === "customerLogin" ? "#ffffff" : "transparent",
              color: activeTab === "customerLogin" ? "#d4af37" : "#64748b",
              boxShadow: activeTab === "customerLogin" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("customerSignup")}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              background: activeTab === "customerSignup" ? "#ffffff" : "transparent",
              color: activeTab === "customerSignup" ? "#d4af37" : "#64748b",
              boxShadow: activeTab === "customerSignup" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Signup
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("adminLogin")}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              background: activeTab === "adminLogin" ? "#ffffff" : "transparent",
              color: activeTab === "adminLogin" ? "#0f172a" : "#64748b",
              boxShadow: activeTab === "adminLogin" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Admin
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            ❌ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            ✅ {successMsg}
          </div>
        )}

        {/* CUSTOMER LOGIN FORM */}
        {activeTab === "customerLogin" && (
          <form onSubmit={handleCustomerLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Email Address</label>
              <div className="input-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
              <span>{loading ? "Logging in..." : "Login to Account"}</span>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
            </button>
          </form>
        )}

        {/* CUSTOMER SIGNUP FORM */}
        {activeTab === "customerSignup" && (
          <form onSubmit={handleCustomerSignup} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Full Name</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Email Address</label>
              <div className="input-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Phone Number</label>
              <div className="input-wrap">
                <i className="fa-solid fa-phone"></i>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Confirm Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
              <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-user-plus"></i>}
            </button>
          </form>
        )}

        {/* ADMIN LOGIN FORM */}
        {activeTab === "adminLogin" && (
          <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Admin Username / Email</label>
              <div className="input-wrap">
                <i className="fa-solid fa-shield-halved"></i>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Admin Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-key"></i>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: "0.5rem", background: "#0f172a" }}>
              <span>{loading ? "Verifying..." : "Login Admin Dashboard"}</span>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-gauge"></i>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

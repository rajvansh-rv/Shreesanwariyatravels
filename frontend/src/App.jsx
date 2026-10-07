import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AuthModal from "./components/AuthModal";
import CustomerDashboardModal from "./components/CustomerDashboardModal";
import ReviewFormModal from "./components/ReviewFormModal";

function MainContent() {
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === "#admin" ? "admin" : "home";
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [customerDashboardOpen, setCustomerDashboardOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#admin") {
        setCurrentView("admin");
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSetView = (view) => {
    setCurrentView(view);
    if (view === "admin") {
      window.location.hash = "admin";
    } else {
      window.location.hash = "";
    }
  };

  return (
    <>
      <Loader />
      <CustomCursor />
      <Navbar
        currentView={currentView}
        setCurrentView={handleSetView}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenCustomerDashboard={() => setCustomerDashboardOpen(true)}
      />

      {currentView === "home" ? (
        <Home onOpenWriteReview={() => setReviewFormOpen(true)} />
      ) : (
        <Admin />
      )}

      <Footer setCurrentView={handleSetView} />
      <ScrollToTop />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Customer Dashboard & Booking History Modal */}
      <CustomerDashboardModal
        isOpen={customerDashboardOpen}
        onClose={() => setCustomerDashboardOpen(false)}
        onOpenWriteReview={() => setReviewFormOpen(true)}
      />

      {/* Customer Review Form Modal */}
      <ReviewFormModal
        isOpen={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onReviewSubmitted={() => {
          // If customer dashboard is open or home page is active, refresh can trigger smoothly
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
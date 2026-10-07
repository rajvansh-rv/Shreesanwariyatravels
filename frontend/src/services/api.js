const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Get current stored auth token (either user token or admin token)
 */
export function getStoredToken() {
  return localStorage.getItem("token") || localStorage.getItem("adminToken") || "";
}

/**
 * Submit a new booking request to the backend.
 * Automatically attaches Authorization header if user is logged in.
 * @param {Object} bookingData - { name, phone, pickup, destination, tdate, cartype, message }
 */
export async function submitBooking(bookingData) {
  const token = getStoredToken();
  const payload = {
    ...bookingData,
    cartype: bookingData.cartype && bookingData.cartype.trim() !== "" ? bookingData.cartype : "Any / Suggest me"
  };

  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to submit booking");
  }

  return data;
}

/**
 * Register a new customer account.
 * @param {Object} userData - { name, email, phone, password, confirmPassword }
 */
export async function registerCustomer(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

/**
 * Authenticate customer or admin.
 * @param {Object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Invalid credentials");
  }

  return data;
}

/**
 * Legacy Admin login alias
 * @param {Object} credentials - { username, password }
 */
export async function adminLogin(credentials) {
  return loginUser({ email: credentials.username, password: credentials.password });
}

/**
 * Fetch current user profile.
 */
export async function fetchUserProfile() {
  const token = getStoredToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data.user;
}

/**
 * Fetch logged-in customer's own booking history.
 */
export async function fetchCustomerBookings() {
  const token = getStoredToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/users/me/bookings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch booking history");
  }

  return data.bookings || [];
}

/**
 * Update customer profile.
 */
export async function updateUserProfile(profileData) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

/**
 * Fetch admin summary statistics.
 */
export async function fetchAdminStats() {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch dashboard statistics");
  }

  return data.stats;
}

/**
 * Fetch admin bookings with search, filter, and sort options.
 */
export async function fetchAdminBookings({ search = "", status = "All", dateFilter = "All", sortBy = "newest" } = {}) {
  const token = getStoredToken();
  const params = new URLSearchParams({ search, status, dateFilter, sortBy });

  const response = await fetch(`${API_BASE_URL}/admin/bookings?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch bookings");
  }

  return data.bookings || [];
}

export async function fetchBookings() {
  return fetchAdminBookings();
}

/**
 * Update booking status (Admin Protected).
 */
export async function updateBookingStatus(id, status) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update booking status");
  }

  return data;
}

/**
 * Delete a booking by ID (Admin Protected).
 */
export async function deleteBooking(id) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to delete booking");
  }

  return data;
}

/**
 * Export bookings as CSV file download (Admin Protected).
 */
export async function exportBookingsCSV({ search = "", status = "All", dateFilter = "All" } = {}) {
  const token = getStoredToken();
  const params = new URLSearchParams({ search, status, dateFilter });

  const response = await fetch(`${API_BASE_URL}/admin/export?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to export bookings");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shree_sanwariya_bookings_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ============================================================
// REVIEWS SERVICE METHODS
// ============================================================

/**
 * Fetch public overall review rating summary and star distribution.
 */
export async function fetchReviewSummary() {
  const response = await fetch(`${API_BASE_URL}/reviews/summary`, {
    method: "GET"
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch review summary");
  }

  return data.summary;
}

/**
 * Fetch public featured reviews for homepage carousel (max 10).
 */
export async function fetchFeaturedReviews(limit = 10) {
  const response = await fetch(`${API_BASE_URL}/reviews/featured?limit=${limit}`, {
    method: "GET"
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch featured reviews");
  }

  return data.reviews || [];
}

/**
 * Fetch customer's eligible (unreviewed) bookings.
 */
export async function fetchEligibleBookings() {
  const token = getStoredToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/reviews/eligible-bookings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch eligible bookings");
  }

  return data.eligibleBookings || [];
}

/**
 * Submit a customer review linked to a booking.
 * @param {Object} reviewData - { bookingId, rating, comment }
 */
export async function submitCustomerReview(reviewData) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to submit review");
  }

  return data;
}

/**
 * Fetch customer's own submitted reviews.
 */
export async function fetchMyReviews() {
  const token = getStoredToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/reviews/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch your reviews");
  }

  return data.reviews || [];
}

/**
 * Fetch admin review list with statistics and filters.
 */
export async function adminFetchReviews({ status = "All", rating = "All", search = "", sortBy = "newest" } = {}) {
  const token = getStoredToken();
  const params = new URLSearchParams({ status, rating, search, sortBy });

  const response = await fetch(`${API_BASE_URL}/reviews/admin?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch reviews");
  }

  return data;
}

/**
 * Update review moderation status (Approved | Rejected | Pending).
 */
export async function adminUpdateReviewStatus(id, status) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update review status");
  }

  return data;
}

/**
 * Toggle featured status for an approved review.
 */
export async function adminToggleFeaturedReview(id, isFeatured) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/reviews/${id}/feature`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isFeatured })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update featured status");
  }

  return data;
}

/**
 * Delete a review permanently.
 */
export async function adminDeleteReview(id) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete review");
  }

  return data;
}

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authenticate JWT token or static admin token.
 * Attaches decoded user object to req.user.
 */
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required."
    });
  }

  const token = authHeader.split(" ")[1];

  // 1. Check for single admin static token
  if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
    req.user = {
      _id: "admin",
      id: "admin",
      name: "Admin",
      email: process.env.ADMIN_USERNAME || "admin",
      role: "admin"
    };
    return next();
  }

  // 2. Verify JWT token for customers / admin users
  try {
    const jwtSecret = process.env.JWT_SECRET || "sanwariya_travels_jwt_secret_key_2026_secure";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid or user no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again."
    });
  }
};

/**
 * Require Admin Role Authorization.
 * Ensures the authenticated user has admin privileges.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin authorization required."
    });
  }
  next();
};

// Legacy compatibility alias for existing routes
const verifyAdminToken = (req, res, next) => {
  authenticateUser(req, res, () => {
    requireAdmin(req, res, next);
  });
};

module.exports = {
  authenticateUser,
  requireAdmin,
  verifyAdminToken
};
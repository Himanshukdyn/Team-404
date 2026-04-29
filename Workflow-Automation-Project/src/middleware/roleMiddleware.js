// MAIN AUTHORIZATION MIDDLEWARE
// src/middleware/roleMiddleware.js
// Role-Based Access Control (RBAC) middleware

// authorizeRoles("Admin"), authorizeRoles("Admin","Manager")

// The function accepts a rest parameter (...roles) — meaning it can take any number of roles:
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user generated from authMiddleware's protect middleware  
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      // MEANS if req.user.role is not in the roles array
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

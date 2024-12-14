const jwt = require("jsonwebtoken");
// const User = require("../models/User");

const unprotectedRoutes = ["/api/users/login", "/api/users/signup"];

const protect = async (req, res, next) => {
  if (unprotectedRoutes.includes(req.path)) {
    return next(); // Skip authentication for unprotected routes
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };

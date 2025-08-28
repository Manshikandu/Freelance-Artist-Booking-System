  import jwt from "jsonwebtoken";
  import User from "../models/user.model.js";

  
  import Artist from "../models/Artist.model.js";
  export const protectRoute = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Check both collections
    let user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      user = await Artist.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Unauthorized - Token expired"
        : "Unauthorized - Invalid token";
    console.error("JWT Auth Error:", error);
    return res.status(401).json({ message });
  }
  };

  export const adminRoute = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user info" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admins only" });
    }

    next();
  };

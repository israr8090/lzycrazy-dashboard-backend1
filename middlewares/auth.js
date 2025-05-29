import jwt from "jsonwebtoken";
import { userModel } from "../models/userSchema.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Please login to access this resource" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
    req.user = await userModel.findById(decoded.id).select("-password"); // password exclude kiya

    if (!req.user) {
      return res.status(401).json({ message: "User not found, invalid token" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

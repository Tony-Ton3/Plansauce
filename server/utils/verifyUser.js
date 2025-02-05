import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies);
  // console.log("Headers received:", req.headers);
  const token = req.cookies.access_token;
  if (!token) {
    console.log("No token found in cookies");
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return next(errorHandler(401, "Unauthorized"));
    }
    // console.log("Token verified successfully for user:", user);
    req.user = user;
    next();
  });
};

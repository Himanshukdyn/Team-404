// MAIN AUTHENTICATION MIDDLEWARE
// Basically for verifying the generated token when user makes a request and attaching the user to req object for subsequent middleware or route handlers to use.

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


// an asynchronous middleware named "protect".
// use 3 parameters: req, res, next where next() passes control to next middleware or routehandler.
const protect = async (req, res, next) => {    
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];   //Splits the Authorization header for token from empty space.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);   // Verifies the token using JWT_SECRET. if verified gives payload as response which has id in it
      req.user = await User.findById(decoded.id).select("-password");   //Finds user by id from payload and attaches user object to req excluding password field. So subsequent middleware can know which user made the req.
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect }; // ✅ named export

const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema"); // Adjust the path as necessary
const errorLogger = require("../logger/errorLogger");
const successLogger = require("../logger/successLogger");
const Customer = require("../models/CustomerSchema");

const tokenVerificationMiddleware = async (req, res, next) => {
  const {role} = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Assuming Bearer token
  if (!token) {
    errorLogger.error("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret
    console.log("decoded: ", decoded);
    // Check if user exists
    if(role === 'Customer'){
      const user = await Customer.findById(decoded.customer.id);
      if (!user) {
        errorLogger.error("Customer not found");
        return res.status(404).json({ message: "Customer not found" });
      }
  
      req.user = user; // Attach user information to request object
  
      successLogger.http("Successfull token verfication");
      next();
    }else{
      const user = await User.findById(decoded.user.id);
      if (!user) {
        errorLogger.error("User not found");
        return res.status(404).json({ message: "User not found" });
      }
  
      req.user = user; // Attach user information to request object
  
      successLogger.http("Successfull token verfication");
      next();
    }
  } catch (error) {
    errorLogger.error(`Invalid token: ${error.message}`);
    return res.status(401).json({ message: `Invalid token: ${error.message}` });
  }
};

module.exports = { tokenVerificationMiddleware };

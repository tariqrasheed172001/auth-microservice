const CacheSchema = require("../models/CacheSchema"); // Import the cacheSchema model
const sendOTPEmail = require("../utils/emailUtils");
const errorLogger = require("../logger/errorLogger");
const successLogger = require("../logger/successLogger");
const warnLogger = require("../logger/warnLogger");

exports.identifyCustomer = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    // Check if the required fields are provided
    if (!name || !email || !phone) {
      warnLogger.warn("Missing required customer details");
      return res
        .status(400)
        .json({ msg: "Name, email, and phone are required" });
    }

    // Generate OTP and ensure it is a 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, "0");

    // Check if the email exists in the cacheSchema collection
    let cacheSchema = await CacheSchema.findOne({ email });

    if (cacheSchema) {
      // Update OTP for existing temporary customer
      cacheSchema.otp = otp;
      await cacheSchema.save();
      successLogger.http("Updated OTP for existing customer");
    } else {
      // Save new customer details and OTP to temporary storage
      cacheSchema = new CacheSchema({ name, email, phone, otp });
      await cacheSchema.save();
      successLogger.http("Saved new temporary customer");
    }

    // Send OTP email
    await sendOTPEmail(email, otp);
    successLogger.http("OTP sent to customer's email:", email);
    res
      .status(200)
      .json({ msg: "OTP sent to your email. Please verify to continue." });
  } catch (err) {
    errorLogger.error(`Internal server error: ${err.message}`);
    res.status(500).send("Server error");
  }
};

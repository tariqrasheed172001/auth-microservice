const User = require("../models/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../utils/emailUtils");
const errorLogger = require("../logger/errorLogger");
const successLogger = require("../logger/successLogger");
const warnLogger = require("../logger/warnLogger");
const CacheSchema = require("../models/CacheSchema");

exports.signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      errorLogger.error("User already exists with this email!");
      return res.status(400).json({ msg: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if the email exists in the cacheSchema collection
    let cacheSchema = await CacheSchema.findOne({ email });

    if (cacheSchema) {
      // Update OTP for existing temporary customer
      cacheSchema.otp = otp;
      cacheSchema.name = name;
      cacheSchema.phone = phone;
      cacheSchema.password = await bcrypt.hash(
        password,
        await bcrypt.genSalt(10)
      ); // Hash the password
      await cacheSchema.save();
      successLogger.http("Saved user details temporary for 2 minutes");
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save new customer details and OTP to temporary storage
      cacheSchema = new CacheSchema({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
      });
      await cacheSchema.save();
      successLogger.http("Saved user details temporary for 2 minutes");
    }

    // Send OTP email
    await sendOTPEmail(email, otp);
    res.status(200).json({ msg: "OTP sent to email for verification" });
  } catch (err) {
    errorLogger.error(`Internal server error: ${err.message}`);
    res.status(500).send("Server error");
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      warnLogger.warn("Invalid email!");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      warnLogger.warn("Invalid password!");
      return res.status(400).json({ msg: "Invalid password" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        successLogger.http("Successful authentication");
        res.json({ token });
      }
    );
  } catch (err) {
    errorLogger.error(`Internal server error ${err.message}`);
    res.status(500).send("Server error");
  }
};

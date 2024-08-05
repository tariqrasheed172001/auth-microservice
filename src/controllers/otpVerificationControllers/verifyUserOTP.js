const User = require("../../models/UserSchema");
const CacheSchema = require("../../models/CacheSchema"); // Assuming you have a cacheSchema model
const generateToken = require("../../utils/tokenUtils");
const errorLogger = require("../../logger/errorLogger");
const successLogger = require("../../logger/successLogger");
const warnLogger = require("../../logger/warnLogger");

exports.verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const cacheSchema = await CacheSchema.findOne({ email, otp });
    if (!cacheSchema) {
      warnLogger.warn("Invalid email or OTP!");
      return res.status(400).json({ msg: "Invalid email or OTP" });
    }

    let existingUser = await User.findOne({ email });
    let newUser = null; // Initialize newUser variable

    let payload;
    if (existingUser) {
      // Update existing user's OTP
      existingUser.otp = otp;
      await existingUser.save();
      payload = {
        user: { id: existingUser._id },
      };
    } else {
      // Create new user and save to database
      newUser = new User({
        name: cacheSchema.name,
        email: cacheSchema.email,
        phone: cacheSchema.phone,
        password: cacheSchema.password,
        otp: otp,
      });

      await newUser.save();
      payload = {
        user: { id: newUser._id },
      };
    }

    // Remove from temporary storage
    await CacheSchema.deleteOne({ email });

    // Generate token
    const token = generateToken(payload);

    successLogger.http("User OTP verification successful");
    const response = {
      user: {
        id: existingUser ? existingUser._id : newUser._id,
        name: existingUser ? existingUser.name : newUser.name,
        email: existingUser ? existingUser.email : newUser.email,
        phone: existingUser ? existingUser.phone : newUser.phone,
      },
      token,
    };
    res.json(response);
  } catch (err) {
    errorLogger.error(`Internal server error: ${err.message}`);
    res.status(500).send("Server error");
  }
};

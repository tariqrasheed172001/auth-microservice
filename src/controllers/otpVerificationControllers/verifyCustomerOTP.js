const CacheSchema = require("../../models/CacheSchema"); // Assuming you have a cacheSchema model
const Customer = require("../../models/CustomerSchema");
const generateToken = require("../../utils/tokenUtils");
const errorLogger = require("../../logger/errorLogger");
const successLogger = require("../../logger/successLogger");
const warnLogger = require("../../logger/warnLogger");

exports.verifyCustomerOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const cacheSchema = await CacheSchema.findOne({ email, otp });
    if (!cacheSchema) {
      warnLogger.warn("Invalid email or OTP!");
      return res.status(400).json({ msg: "Invalid email or OTP" });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update existing customer details
      customer.name = cacheSchema.name;
      customer.phone = cacheSchema.phone;
      customer.otp = otp;

      await customer.save();
    } else {
      // Create new customer and save to database
      customer = new Customer({
        name: cacheSchema.name,
        email: cacheSchema.email,
        phone: cacheSchema.phone,
        otp: otp,
      });

      await customer.save();
    }

    // Remove from temporary storage
    await CacheSchema.deleteOne({ email });

    // Generate token
    const payload = { customer: { id: customer._id } };
    const token = generateToken(payload);

    successLogger.http("Customer OTP verification successful");
    const response = {
      customer,
      token,
    };
    res.json(response);
  } catch (err) {
    errorLogger.error(`Internal server error: ${err.message}`);
    res.status(500).send("Server error");
  }
};

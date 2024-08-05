const User = require("../../models/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorLogger = require("../../logger/errorLogger");
const successLogger = require("../../logger/successLogger");
const warnLogger = require("../../logger/warnLogger");

exports.signInController = async (req, res) => {
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

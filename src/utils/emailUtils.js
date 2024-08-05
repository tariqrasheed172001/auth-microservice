const nodemailer = require("nodemailer");
const infoLogger = require("../logger/infoLogger");
const errorLogger = require("../logger/errorLogger");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", // Correct the typo here
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: "DexKor verification team",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "DexKor verification OTP",
    text: `Your DexKor verification OTP is ${otp}`,
  };

  infoLogger.info(`Attempting to send email to: ${email} with OTP: ${otp}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    infoLogger.info(`Email sent successfully: ${info.response}`);
    return info;
  } catch (error) {
    errorLogger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

module.exports = sendOTPEmail;

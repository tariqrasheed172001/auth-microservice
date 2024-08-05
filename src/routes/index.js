const express = require("express");
const mainRouter = express.Router();

const authRoutes = require('./authRoutes');
const tokenRoutes = require('./tokenRoutes');
const otpRoutes = require("./otpRoutes");

mainRouter.use("/auth", authRoutes);
mainRouter.use('/otp', otpRoutes);
mainRouter.use("/token", tokenRoutes)

module.exports = mainRouter;

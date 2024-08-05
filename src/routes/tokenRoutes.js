const express = require('express');
const tokenRoutes = express.Router();

const {tokenVerificationMiddleware} = require('../middleware/tokenVerificationMiddleware');
const {verifyTokenController} = require("../controllers/verifyTokenController");

// New route to verify token and check user existence
tokenRoutes.post('/verify', tokenVerificationMiddleware, verifyTokenController);

module.exports = tokenRoutes;

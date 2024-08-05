const express = require('express');
const { verifyCustomerOTP } = require('../controllers/otpVerificationControllers/verifyCustomerOTP');
const { verifyUserOTP } = require('../controllers/otpVerificationControllers/verifyUserOTP');
const otpRoutes = express.Router();

otpRoutes.post('/verify/customer', verifyCustomerOTP);
otpRoutes.post('/verify/user', verifyUserOTP);


module.exports = otpRoutes;

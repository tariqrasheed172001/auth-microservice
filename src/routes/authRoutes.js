const express = require('express');
const authRoutes = express.Router();
const {identifyCustomer} = require('../controllers/customerController');
const { signUpController } = require('../controllers/AuthControllers/signUpController');
const { signInController } = require('../controllers/AuthControllers/signInController');

authRoutes.post('/signup', signUpController);
authRoutes.post('/signin', signInController);

// Define route for identifying customer
authRoutes.post('/identify-customer', identifyCustomer);


module.exports = authRoutes;

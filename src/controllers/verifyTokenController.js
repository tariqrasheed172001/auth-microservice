const successLogger = require('../logger/successLogger');

exports.verifyTokenController = (req, res) => {
    successLogger.http("Successfull token validation.");
    res.status(200).json({ message: 'Token is valid'});
  }
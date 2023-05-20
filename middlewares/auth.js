const jwt = require("jsonwebtoken");
module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }
    const token = req.headers.authorization.split(" ")[1];

    const payload = await jwt.verify(token, process.env.SECRET_KEY);
    req.payload = payload;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

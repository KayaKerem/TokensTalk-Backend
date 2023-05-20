const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

exports.register = async (req, res, next) => {
  const wallet_address = req.body.wallet_address;
  const user_name = req.body.user_name;
  const avatar_url = req.body.avatar_url;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const userExists = await User.findOne({ wallet_address: wallet_address });

    if (userExists) {
      const error = new Error("User exists");
      error.statusCode = 409;
      throw error;
    }

    const user = new User({
      user_name: user_name,
      wallet_address: wallet_address,
      avatar_url: avatar_url,
      password: hashedPassword,
    });
    await user.save();

    res.json({
      message: "User registered successfully",
      user: user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const wallet_address = req.body.wallet_address;
  const password = req.body.password;
  //  ≈
  try {
    const user = await User.findOne({
      wallet_address: wallet_address,
    });

    if (!user) {
      //user kaydolmamış
    }

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY);
    res.json({
      message: "User logged in successfully",
      userId: user._id,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAvatars = async (req, res, next) => {
  var dirPath = "images/avatars";
  try {
    fs.readdir(dirPath.toString(), function (err, filesPath) {
      if (err) throw err;
      filesPath = filesPath.map(function (filePath) {
        //generating paths to file
        return dirPath + filePath;
      });
      res.status(201).json({
        message: "success",
        avatars: filesPath,
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

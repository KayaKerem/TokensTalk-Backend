const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const publisher = require("../services/publisher");

exports.register = async (req, res, next) => {
  const wallet_address = req.body.wallet_address;
  const user_name = req.body.user_name;
  const avatar_url = req.body.avatar_url ?? "u";
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
    // const userId = user._id.toString();
    const result = await publisher({
      wallet_address: wallet_address,
    });
    if (!result) {
      throw new Error("Cannot appended to queue");
    }

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
  const user_name = req.body.user_name;
  const password = req.body.password;

  try {
    const user = await User.findOne({
      user_name: user_name,
    });

    if (!user) {
      //user kaydolmamış
      const error = new Error("User hasn't yet registered");
      error.statusCode = 409;
      throw error;
    }

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
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

exports.setAvatar = async (req, res, next) => {
  const new_url = req.body.avatar_url;
  const userId = req.body.userId;

  try {
    const user = await User.findById(userId);

    user.avatar_url = new_url;

    await user.save();
    res.json({
      message: "success",
      user: user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getChatrooms = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId: userId });
    const chatrooms = user.chatrooms;

    res.json({
      message: "Chats fetched successfully",
      chatrooms: chatrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const mongoose = require("mongoose");
const Chatroom = require("../models/chatroom");

exports.createChatroom = async (req, res, next) => {
  const name = req.body.name;
  const avatar_url = req.body.avatar_url;
  const contract_address = req.body.contract_address;
  try {
    const chatroomExists = await Chatroom.findOne({
      contract_address: contract_address,
    });

    if (chatroomExists) {
      const error = new Error("Chatroom exists");
      error.statusCode = 409;
      throw error;
    }
    const chatroom = new Chatroom({
      name: name,
      avatar_url: avatar_url,
      contract_address: contract_address,
    });
    await chatroom.save();

    res.json({
      message: "Chatroom created successfully",
      chatroom: chatroom,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllChatrooms = async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({});
    res.json({
      chatrooms: chatrooms,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

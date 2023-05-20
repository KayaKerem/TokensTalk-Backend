const Message = require("../models/message");

exports.newMessage = async (req, res, next) => {
  const userId = req.body.userId;
  const chatId = req.body.chatId;
  const message_text = req.body.message_text;

  try {
    const message = new Message({
      chatroom: chatId,
      user: userId,
      message: message_text,
    });
    await message.save();
    res.json({ message: "Success", messageObj: message });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  const chatId = req.params.chatId;
  try {
    const messages = await Message.where({ chatroom: chatId });

    res.json({
      messages: messages,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

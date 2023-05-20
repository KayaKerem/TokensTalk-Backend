const Message = require("../models/message");

exports.newMessage = async (req, res, next) => {
  const userId = req.body.userId;
  const chatId = req.body.chatId;
  const message_text = req.body.message_text;

  const message = new Message({
    chatroom: chatId,
    user: userId,
    message: message_text,
  });
  await message.save();
  res.json({ message: "Success", messageObj: message });
};

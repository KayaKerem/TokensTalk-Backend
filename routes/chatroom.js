const express = require("express");
const chatroomController = require("../controllers/chatroom");
const router = express.Router();

router.get("/", chatroomController.getAllChatrooms);
router.post("/create", chatroomController.createChatroom);

module.exports = router;

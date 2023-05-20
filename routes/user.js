const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/avatars", userController.getAvatars);
router.get("/chatrooms/:userId", userController.getChatrooms);

module.exports = router;

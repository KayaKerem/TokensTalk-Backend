const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/avatars", userController.getAvatars);

module.exports = router;

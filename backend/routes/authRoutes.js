const express = require("express");
const router = express.Router();
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.post("/login", passport.authenticate("local"), authController.login);

router.get("/logout", authMiddleware.requireAuth, authController.logout);

module.exports = router;

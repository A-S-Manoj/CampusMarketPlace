const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const authenticateToken = require("../middleware/authMiddleware");

// All support routes require authentication
router.post("/message", authenticateToken, supportController.submitMessage);

module.exports = router;

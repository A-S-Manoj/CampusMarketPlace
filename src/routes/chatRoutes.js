const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticateToken } = require("../middleware/authMiddleware");

// All chat routes require authentication
router.use(authenticateToken);

// Start a conversation or get existing one
router.post("/conversations", chatController.startConversation);

// Get all conversations for the logged in user
router.get("/conversations", chatController.getUserConversations);

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", chatController.getConversationMessages);

module.exports = router;

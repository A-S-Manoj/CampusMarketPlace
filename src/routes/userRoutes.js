const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, upload.single("profile_pic"), userController.updateProfile);

module.exports = router;

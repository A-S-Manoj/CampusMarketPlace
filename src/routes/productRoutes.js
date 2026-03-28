const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", productController.getAllProducts);

router.post("/", authenticateToken, upload.single("image"), productController.createProduct);

router.get("/:id", productController.getProductById);

module.exports = router;
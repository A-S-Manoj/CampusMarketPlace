const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", productController.getAllProducts);

router.post("/", authenticateToken, productController.createProduct);

module.exports = router;
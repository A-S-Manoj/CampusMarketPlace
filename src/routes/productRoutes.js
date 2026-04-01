const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { authenticateToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", authenticateToken, productController.getAllProducts);

router.get("/my-products", authenticateToken, productController.getMyProducts);

router.post("/", authenticateToken, upload.single("image"), productController.createProduct);

router.get("/:id", productController.getProductById);

router.put("/:id", authenticateToken, upload.single("image"), productController.updateProduct);

router.delete("/:id", authenticateToken, productController.deleteProduct);

module.exports = router;
const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            category: req.query.category,
            excludeSellerId: req.user ? req.user.id : null,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
            type: req.query.type,
            timeframe: req.query.timeframe
        };

        const products = await productService.getAllProducts(filters);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getMyProducts = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const products = await productService.getMyProducts(seller_id);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productService.getProductById(id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const productData = { ...req.body };

        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        } else {
            productData.image_url = null;
        }

        const productId = await productService.createProduct(productData, seller_id);
        res.status(201).json({ message: "Product created", id: productId });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const id = req.params.id;
        const productData = { ...req.body };

        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        }

        const message = await productService.updateProduct(id, productData, seller_id);
        res.json({ message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const id = req.params.id;

        const message = await productService.deleteProduct(id, seller_id);
        res.json({ message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};
const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {

    try {

        const products = await productService.getAllProducts();

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

        const productId = await productService.createProduct(
            req.body,
            seller_id
        );

        res.status(201).json({
            message: "Product created",
            id: productId
        });

    } catch (error) {

        res.status(500).json({ message: error });

    }

};
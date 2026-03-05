const db = require("../config/db");

exports.getAllProducts = () => {

    return new Promise((resolve, reject) => {

        const sql = "SELECT * FROM products";

        db.query(sql, (err, results) => {

            if (err) return reject("Error fetching products");

            resolve(results);

        });

    });

};

exports.createProduct = (productData, seller_id) => {

    return new Promise((resolve, reject) => {

        const { title, description, price, category, type } = productData;

        const sql = `
        INSERT INTO products
        (title, description, price, category, type, seller_id)
        VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [title, description, price, category, type, seller_id],
            (err, result) => {

                if (err) return reject("Error creating product");

                resolve(result.insertId);

            }
        );
    });
};

exports.getProductById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM products WHERE id = ?";
        db.query(sql, [id], (err, results) => {

            if (err) return reject("Error fetching product");

            resolve(results[0]);

        });
    });
};
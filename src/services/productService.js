const db = require("../config/db");

exports.getAllProducts = (filters) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM products WHERE 1=1";
        let params = [];

        if (filters.excludeSellerId) {
            sql += " AND seller_id != ?";
            params.push(filters.excludeSellerId);
        }
        
        if (filters.category) {
            sql += " AND category = ?";
            params.push(filters.category);
        }

        if (filters.search) {
            sql += " AND (title LIKE ? OR description LIKE ?)";
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.minPrice) {
            sql += " AND price >= ?";
            params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            sql += " AND price <= ?";
            params.push(filters.maxPrice);
        }

        if (filters.type) {
            sql += " AND type = ?";
            params.push(filters.type);
        }

        if (filters.timeframe === "today") {
            sql += " AND created_at >= CURDATE()";
        } else if (filters.timeframe === "weekly") {
            sql += " AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        }

        sql += " ORDER BY id DESC";

        db.query(sql, params, (err, results) => {
            if (err) return reject("Error fetching products");
            resolve(results);
        });
    });
};

exports.getMyProducts = (seller_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC";
        db.query(sql, [seller_id], (err, results) => {
            if (err) return reject("Error fetching user products");
            resolve(results);
        });
    });
};

exports.createProduct = (productData, seller_id) => {
    return new Promise((resolve, reject) => {
        const { title, description, price, category, type, image_url } = productData;
        const sql = `
        INSERT INTO products
        (title, description, price, category, type, image_url, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            sql,
            [title, description, price, category, type, image_url, seller_id],
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

exports.updateProduct = (id, productData, seller_id) => {
    return new Promise((resolve, reject) => {
        const { title, description, price, category, type, image_url } = productData;
        let sql = "UPDATE products SET title=?, description=?, price=?, category=?, type=?";
        let params = [title, description, price, category, type];

        if (image_url) {
            sql += ", image_url=?";
            params.push(image_url);
        }

        sql += " WHERE id=? AND seller_id=?";
        params.push(id, seller_id);

        db.query(sql, params, (err, result) => {
            if (err) return reject("Error updating product");
            if (result.affectedRows === 0) return reject("Unauthorized or product not found");
            resolve("Product updated successfully");
        });
    });
};

exports.deleteProduct = (id, seller_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM products WHERE id = ? AND seller_id = ?";
        db.query(sql, [id, seller_id], (err, result) => {
            if (err) return reject("Error deleting product");
            if (result.affectedRows === 0) return reject("Unauthorized or product not found");
            resolve("Product deleted successfully");
        });
    });
};
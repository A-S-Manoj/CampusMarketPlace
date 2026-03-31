const db = require("../config/db");

exports.getAllProducts = (filters) => {
    return new Promise((resolve, reject) => {
        let whereSql = " WHERE 1=1";
        let params = [];

        if (filters.excludeSellerId) {
            whereSql += " AND seller_id != ?";
            params.push(filters.excludeSellerId);
        }
        
        if (filters.category) {
            whereSql += " AND category = ?";
            params.push(filters.category);
        }

        if (filters.search) {
            whereSql += " AND (title LIKE ? OR description LIKE ?)";
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.minPrice) {
            whereSql += " AND price >= ?";
            params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            whereSql += " AND price <= ?";
            params.push(filters.maxPrice);
        }

        if (filters.type) {
            whereSql += " AND type = ?";
            params.push(filters.type);
        }

        if (filters.timeframe === "today") {
            whereSql += " AND created_at >= CURDATE()";
        } else if (filters.timeframe === "weekly") {
            whereSql += " AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        }

        // Count total matching products
        const countSql = "SELECT COUNT(*) AS total FROM products" + whereSql;
        db.query(countSql, [...params], (err, countResult) => {
            if (err) return reject(new Error("Error counting products: " + err.message));

            const total = countResult[0].total;
            const page = filters.page || 1;
            const limit = filters.limit || 12;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;

            const dataSql = "SELECT * FROM products" + whereSql + " ORDER BY id DESC LIMIT ? OFFSET ?";
            db.query(dataSql, [...params, limit, offset], (err, results) => {
                if (err) return reject(new Error("Error fetching products: " + err.message));
                resolve({ products: results, totalPages, currentPage: page, totalProducts: total });
            });
        });
    });
};

exports.getMyProducts = (seller_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC";
        db.query(sql, [seller_id], (err, results) => {
            if (err) return reject(new Error("Error fetching user products: " + err.message));
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
                if (err) return reject(new Error("Error creating product: " + err.message));
                resolve(result.insertId);
            }
        );
    });
};

exports.getProductById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM products WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) return reject(new Error("Error fetching product: " + err.message));
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
            if (err) return reject(new Error("Error updating product: " + (err ? err.message : "Unknown error")));
            if (result.affectedRows === 0) return reject(new Error("Unauthorized or product not found"));
            resolve("Product updated successfully");
        });
    });
};

exports.deleteProduct = (id, seller_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM products WHERE id = ? AND seller_id = ?";
        db.query(sql, [id, seller_id], (err, result) => {
            if (err) return reject(new Error("Error deleting product: " + (err ? err.message : "Unknown error")));
            if (result.affectedRows === 0) return reject(new Error("Unauthorized or product not found"));
            resolve("Product deleted successfully");
        });
    });
};
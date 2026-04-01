const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = (name, username, email, password) => {
    return new Promise((resolve, reject) => {

        bcrypt.hash(password, 10, (err, hashedPassword) => {

            if (err) return reject(new Error("Error hashing password: " + err.message));

            const sql =
                "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)";

            db.query(
                sql,
                [name, username, email, hashedPassword],
                (err, result) => {

                    if (err) return reject(new Error("Error registering user: " + (err.code === "ER_DUP_ENTRY" ? "User already exists" : err.message)));

                    resolve("User registered successfully");
                }
            );
        });
    });
};

exports.loginUser = (username, password) => {
    return new Promise((resolve, reject) => {

        const sql = "SELECT * FROM users WHERE username = ?";

        db.query(sql, [username], (err, results) => {

            if (err) return reject(new Error("Database error during login: " + err.message));

            if (results.length === 0)
                return reject("Invalid username or password");

            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {

                if (!isMatch)
                    return reject(new Error("Invalid username or password"));

                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                resolve(token);
            });
        });
    });
};
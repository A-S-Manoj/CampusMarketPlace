const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {

    const { name, username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {

        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        const sql = "INSERT INTO users (name, username, email, password) VALUES (?,?, ?, ?)";

        db.query(sql, [name, username, email, hashedPassword], (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ message: "User already exists" });
            }

            res.json({ message: "User registered successfully" });
        });
    });
};


exports.login = (req, res) => {

    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], (err, results) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({ message: "Login successful", token });
        });
    });
};
require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcrypt");
const express = require("express");
const authenticateToken = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", authRoutes);

app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "You are authorized!", user: req.user });
});

app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
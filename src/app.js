require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcrypt");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const authenticateToken = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});



app.use("/", authRoutes);

app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "You are authorized!", user: req.user });
});

app.use("/api/products", productRoutes);

module.exports = app;
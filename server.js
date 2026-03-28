const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const socketConfig = require("./src/config/socket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Socket.io logic
socketConfig(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
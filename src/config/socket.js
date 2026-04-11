const db = require("./db");

module.exports = (io) => {
    // We can store connected users mapped to their socket IDs if needed
    // Map of userId -> socket.id
    const userSockets = new Map();

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // User registers their socket with their user ID
        socket.on("register", (userId) => {
            if (userId) {
                userSockets.set(String(userId), socket.id);
                console.log(`User ${userId} registered with socket ${socket.id}`);
                // Broadcast that this user is online
                io.emit("user_status", { userId: String(userId), online: true });
            }
        });

        // Handle request for currently online users
        socket.on("request_online_status", () => {
            socket.emit("online_users_list", Array.from(userSockets.keys()));
        });

        // Handle sending a message
        socket.on("send_message", async (data) => {
            const { conversationId, senderId, receiverId, content } = data;

            try {
                // Save to database
                const [result] = await db.promise().query(
                    "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
                    [conversationId, senderId, content]
                );

                const messageId = result.insertId;

                const [messages] = await db.promise().query(
                    "SELECT * FROM messages WHERE id = ?",
                    [messageId]
                );

                const newMessage = messages[0];

                // Send back to sender for confirmation
                socket.emit("receive_message", newMessage);

                // If receiver is connected, send it to them
                if (receiverId) {
                    const receiverSocketId = userSockets.get(String(receiverId));
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("receive_message", newMessage);
                    }
                }
            } catch (err) {
                console.error("Error saving/sending message:", err);
                socket.emit("message_error", { error: "Failed to send message" });
            }
        });

        // Handle trade request notifications
        socket.on("trade_request_send", (data) => {
            const { sellerId, tradeRequest } = data;
            const sellerSocketId = userSockets.get(String(sellerId));
            if (sellerSocketId) {
                io.to(sellerSocketId).emit("trade_request_received", tradeRequest);
            }
            // Also echo back to sender
            socket.emit("trade_request_received", tradeRequest);
        });

        socket.on("trade_request_respond", (data) => {
            const { buyerId, tradeRequest } = data;
            const buyerSocketId = userSockets.get(String(buyerId));
            if (buyerSocketId) {
                io.to(buyerSocketId).emit("trade_request_updated", tradeRequest);
            }
            // Also echo back to seller
            socket.emit("trade_request_updated", tradeRequest);
        });
        
        socket.on("trade_request_cancel", (data) => {
            const { sellerId, tradeRequest } = data;
            const sellerSocketId = userSockets.get(String(sellerId));
            if (sellerSocketId) {
                io.to(sellerSocketId).emit("trade_request_updated", tradeRequest);
            }
            // Also echo back to buyer
            socket.emit("trade_request_updated", tradeRequest);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            // Remove the user from our tracking map
            for (const [userId, sockId] of userSockets.entries()) {
                if (sockId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`Removed user ${userId} from active sockets`);
                    // Broadcast offline status
                    io.emit("user_status", { userId: userId, online: false });
                    break;
                }
            }
        });
    });
};

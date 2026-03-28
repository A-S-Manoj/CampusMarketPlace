const db = require("../config/db");

// Start or get an existing conversation
exports.startConversation = async (req, res) => {
    let { userId2, productId } = req.body;
    const userId1 = req.user.id; // From authenticateToken middleware

    if (!userId2) {
        return res.status(400).json({ error: "Missing required fields: userId2 is required." });
    }

    // Sanitize productId
    if (productId === "undefined" || productId === "null") {
        productId = null;
    }


    // Prevent user from chatting with themselves
    if (userId1 === parseInt(userId2)) {
        return res.status(400).json({ error: "Cannot start a conversation with yourself." });
    }

    try {
        // Check if conversation already exists between these 2 users (and optionally this product)
        let query = `
            SELECT id FROM conversations 
            WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
        `;
        let params = [userId1, userId2, userId2, userId1];

        if (productId) {
            query += " AND product_id = ?";
            params.push(productId);
        } else {
            query += " AND product_id IS NULL";
        }

        const [existingConv] = await db.promise().query(query, params);

        if (existingConv.length > 0) {
            // Conversation exists, return its ID
            return res.status(200).json({ conversationId: existingConv[0].id });
        }

        // Doesn't exist, create a new one
        const [result] = await db.promise().query(
            "INSERT INTO conversations (user1_id, user2_id, product_id) VALUES (?, ?, ?)",
            [userId1, userId2, productId || null]
        );

        res.status(201).json({ conversationId: result.insertId });

    } catch (err) {
        console.error("Error starting conversation:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all conversations for the logged-in user
exports.getUserConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch conversations and join with users table to get the OTHER user's details
        // and optionally join products for product context
        const query = `
            SELECT c.id AS conversation_id, c.created_at,
                   u.id AS other_user_id, u.username AS other_user_name,
                   p.id AS product_id, p.title AS product_name
            FROM conversations c
            JOIN users u ON (u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id))
            LEFT JOIN products p ON c.product_id = p.id
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.created_at DESC
        `;

        const [conversations] = await db.promise().query(query, [userId, userId, userId]);

        res.status(200).json(conversations);

    } catch (err) {
        console.error("Error getting user conversations:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get messages for a conversation
exports.getConversationMessages = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        // First verify the user is part of this conversation
        const [conv] = await db.promise().query(
            "SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
            [conversationId, userId, userId]
        );

        if (conv.length === 0) {
            return res.status(403).json({ error: "Forbidden: You are not part of this conversation." });
        }

        // Fetch messages
        const [messages] = await db.promise().query(
            "SELECT m.id, m.sender_id, m.content, m.created_at, u.username AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = ? ORDER BY m.created_at ASC",
            [conversationId]
        );

        res.status(200).json(messages);

    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

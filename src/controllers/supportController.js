const db = require("../config/db");

const supportController = {
    submitMessage: async (req, res, next) => {
        try {
            const { message } = req.body;
            const userId = req.user.id;

            if (!message || message.trim() === "") {
                const error = new Error("Message cannot be empty.");
                error.status = 400;
                return next(error);
            }

            const sql = "INSERT INTO support_messages (user_id, message) VALUES (?, ?)";
            
            db.query(sql, [userId, message], (err, result) => {
                if (err) return next(err);
                
                res.json({
                    success: true,
                    message: "Your message has been sent to the admin successfully.",
                    messageId: result.insertId
                });
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = supportController;

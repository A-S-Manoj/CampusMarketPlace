const userService = require("../services/userService");

exports.searchUsers = async (req, res, next) => {
    try {
        const username = req.query.username || "";
        const users = await userService.searchUsers(username);
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const message = await userService.deleteUser(userId);
        res.json({ success: true, message });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const stats = await userService.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

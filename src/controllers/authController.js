const authService = require("../services/authService");
const { isValidEmail, isValidPassword, isValidUsername, isValidString } = require("../utils/validators");

exports.register = async (req, res, next) => {
    const { name, username, email, password } = req.body;

    // Manual Validation
    if (!isValidString(name, 2, 100)) {
        return res.status(400).json({ success: false, message: "Invalid name. Must be 2-100 characters." });
    }
    if (!isValidUsername(username)) {
        return res.status(400).json({ success: false, message: "Invalid username. 3-30 characters, alphanumeric or underscores." });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    try {
        const message = await authService.registerUser(
            name,
            username,
            email,
            password
        );

        res.json({ success: true, message });
    } catch (error) {
        // Customize error status for specific cases if needed
        if (error === "User already exists") {
            return res.status(409).json({ success: false, message: error });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        const token = await authService.loginUser(username, password);

        res.json({
            success: true,
            message: "Login successful",
            token
        });
    } catch (error) {
        // For security, login errors should generally return 401
        res.status(401).json({ success: false, message: typeof error === "string" ? error : "Invalid credentials" });
    }
};
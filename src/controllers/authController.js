const authService = require("../services/authService");

exports.register = async (req, res) => {

    const { name, username, email, password } = req.body;

    try {

        const message = await authService.registerUser(
            name,
            username,
            email,
            password
        );

        res.json({ message });

    } catch (error) {

        res.status(500).json({ message: error });

    }
};

exports.login = async (req, res) => {

    const { username, password } = req.body;

    try {

        const token = await authService.loginUser(username, password);

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {

        res.status(401).json({ message: error });

    }
};
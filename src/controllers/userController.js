const userService = require("../services/userService");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await userService.getUserProfile(userId);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = { ...req.body };

        // If an image was uploaded, store the path (Cloudinary URL in prod, local path in dev)
        if (req.file) {
            profileData.profile_pic = req.file.path || `/uploads/${req.file.filename}`;
        }

        const message = await userService.updateUserProfile(userId, profileData);
        res.status(200).json({ message });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

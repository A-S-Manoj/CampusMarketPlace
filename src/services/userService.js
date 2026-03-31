const db = require("../config/db");

exports.getUserProfile = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, name, username, email, mobile_number, student_type, hostel, year_of_study, course, profile_pic 
            FROM users 
            WHERE id = ?
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) return reject(new Error("Error fetching user profile: " + err.message));
            if (results.length === 0) return reject(new Error("User not found"));
            resolve(results[0]);
        });
    });
};

exports.updateUserProfile = (userId, profileData) => {
    return new Promise((resolve, reject) => {
        // Map of allowed fields to their values in profileData
        const allowedFields = [
            "mobile_number",
            "student_type",
            "hostel",
            "year_of_study",
            "course",
            "profile_pic"
        ];

        let setClauses = [];
        let params = [];

        allowedFields.forEach(field => {
            if (profileData[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                params.push(profileData[field]);
            }
        });

        if (setClauses.length === 0) {
            return resolve("No changes to update");
        }

        const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`;
        params.push(userId);

        db.query(sql, params, (err, result) => {
            if (err) return reject(new Error("Error updating user profile: " + err.message));
            resolve("Profile updated successfully");
        });
    });
};

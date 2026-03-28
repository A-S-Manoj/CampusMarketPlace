const db = require("../config/db");

exports.getUserProfile = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, name, username, email, mobile_number, student_type, hostel, year_of_study, course, profile_pic 
            FROM users 
            WHERE id = ?
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) return reject("Error fetching user profile");
            if (results.length === 0) return reject("User not found");
            resolve(results[0]);
        });
    });
};

exports.updateUserProfile = (userId, profileData) => {
    return new Promise((resolve, reject) => {
        const { mobile_number, student_type, hostel, year_of_study, course, profile_pic } = profileData;
        
        // Build dynamic query depending on if profile_pic was uploaded
        let sql = `
            UPDATE users 
            SET mobile_number = ?, student_type = ?, hostel = ?, year_of_study = ?, course = ?
        `;
        let params = [mobile_number, student_type, hostel, year_of_study, course];

        if (profile_pic !== undefined) {
            sql += `, profile_pic = ?`;
            params.push(profile_pic);
        }

        sql += ` WHERE id = ?`;
        params.push(userId);

        db.query(sql, params, (err, result) => {
            if (err) return reject("Error updating user profile");
            resolve("Profile updated successfully");
        });
    });
};

require('dotenv').config();
const db = require('./src/config/db');

const query = `
    ALTER TABLE users
    ADD COLUMN mobile_number VARCHAR(20) DEFAULT NULL,
    ADD COLUMN student_type ENUM('Hosteller', 'Day Scholar') DEFAULT NULL,
    ADD COLUMN hostel VARCHAR(50) DEFAULT NULL,
    ADD COLUMN year_of_study VARCHAR(20) DEFAULT NULL,
    ADD COLUMN course VARCHAR(100) DEFAULT NULL,
    ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL;
`;

db.query(query, (error, results) => {
    if (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
            return process.exit(0);
        } else {
            console.error('Error adding columns:', error);
            return process.exit(1);
        }
    }
    console.log('Successfully added columns to users table.');
    process.exit(0);
});

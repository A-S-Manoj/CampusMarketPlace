const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST ? process.env.DB_HOST.trim() : "",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000,
    user: process.env.DB_USER ? process.env.DB_USER.trim() : "",
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : "",
    database: process.env.DB_NAME ? process.env.DB_NAME.trim() : "",
    ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.code, err.message);
    } else {
        console.log("MySQL Connected ✅");
        connection.release();
    }
});

module.exports = db;
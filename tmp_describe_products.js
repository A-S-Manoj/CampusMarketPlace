require('dotenv').config();
const db = require('./src/config/db');
db.query('DESCRIBE products', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit();
});

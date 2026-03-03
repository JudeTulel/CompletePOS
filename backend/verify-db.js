const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pos.sqlite');

db.all("SELECT username, role, isActive FROM users", [], (err, rows) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Users in database:');
    console.table(rows);
    db.close();
});

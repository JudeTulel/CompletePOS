const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '@1234',
        multipleStatements: true
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS relyon_pos;');
    await connection.query('USE relyon_pos;');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
        console.log('Schema applied successfully.');
    }

    await connection.end();
    console.log('Database relyon_pos created or already exists.');
}

module.exports = { createDatabaseIfNotExists };

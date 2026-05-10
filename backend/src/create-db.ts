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

    // Schema path resolution (priority order):
    // 1. TAURI_RESOURCE_DIR env var (set by Tauri when spawning sidecar)
    // 2. Next to the pkg executable (process.execPath sibling)
    // 3. Dev mode: relative to __dirname
    const isPkg = !!(process as any).pkg;
    const tauriResourceDir = process.env.TAURI_RESOURCE_DIR;

    let schemaPath: string;
    if (tauriResourceDir) {
        schemaPath = path.join(tauriResourceDir, 'schema.sql');
    } else if (isPkg) {
        schemaPath = path.join(path.dirname(process.execPath), 'schema.sql');
    } else {
        schemaPath = path.join(__dirname, '..', 'schema.sql');
    }

    console.log(`[DEBUG] Schema search path: ${schemaPath}`);

    if (fs.existsSync(schemaPath)) {
        try {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await connection.query(schema);
            console.log('Schema applied successfully.');
        } catch (error) {
            console.error('Error applying schema:', error.message);
            throw error;
        }
    } else {
        console.warn(`[WARNING] schema.sql not found at ${schemaPath}. Skipping table initialization.`);
    }

    await connection.end();
    console.log('Database relyon_pos initialized.');
}

module.exports = { createDatabaseIfNotExists };

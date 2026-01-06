const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
console.log(`Patching database at ${dbPath}...`);

const db = new Database(dbPath);

try {
    const tableInfo = db.pragma('table_info(metrics)');
    const columns = tableInfo.map(c => c.name);

    if (!columns.includes('emission_factor')) {
        console.log('Adding emission_factor column...');
        db.exec("ALTER TABLE metrics ADD COLUMN emission_factor REAL DEFAULT 0");
    } else {
        console.log('emission_factor column already exists.');
    }

    if (!columns.includes('type')) {
        console.log('Adding type column...');
        db.exec("ALTER TABLE metrics ADD COLUMN type TEXT DEFAULT 'NUMERIC'");
    } else {
        console.log('type column already exists.');
    }

    console.log('Database patched successfully!');
} catch (error) {
    console.error('Patch failed:', error);
}

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
const db = new Database(dbPath);

console.log('Restoring emission_factor and type columns to metrics table...');

try {
    const cols = db.prepare("PRAGMA table_info(metrics)").all().map(c => c.name);
    
    if (!cols.includes('emission_factor')) {
        db.exec("ALTER TABLE metrics ADD COLUMN emission_factor REAL DEFAULT 0");
        console.log("Added emission_factor column.");
    }

    if (!cols.includes('type')) {
        db.exec("ALTER TABLE metrics ADD COLUMN type TEXT DEFAULT 'NUMERIC'");
        console.log("Added type column.");
    }
    
    console.log("Schema fix applied.");
} catch (e) {
    console.error("Fix failed:", e);
}

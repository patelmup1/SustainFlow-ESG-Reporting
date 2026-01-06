const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
const db = new Database(dbPath);

console.log('--- Table Definitions ---');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
    console.log(`\nTable: ${t.name}`);
    console.log(t.sql);
});

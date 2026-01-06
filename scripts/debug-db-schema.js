const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
const db = new Database(dbPath);

console.log('--- Tables ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name));

console.log('\n--- Views ---');
const views = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='view'").all();
views.forEach(v => console.log(`${v.name}: ${v.sql}`));

console.log('\n--- Triggers ---');
const triggers = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger'").all();
triggers.forEach(t => console.log(`Trigger ${t.name} on ${t.tbl_name}: ${t.sql}`));

console.log('\n--- Checking for users_old ---');
try {
    const count = db.prepare('SELECT count(*) FROM users_old').get();
    console.log('users_old exists, count:', count);
} catch (e) {
    console.log('users_old does not exist:', e.message);
}

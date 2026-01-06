const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
const db = new Database(dbPath);

console.log('Repairing schema constraints...');

db.transaction(() => {
    // 1. Fix Reports Table
    console.log('Fixing reports table...');
    const existingReports = db.prepare("SELECT * FROM reports").all();
    db.exec("DROP TABLE reports");
    
    db.exec(`
        CREATE TABLE reports (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        data_snapshot TEXT,
        file_url TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
        );
    `);
    
    // Restore data if any
    if (existingReports.length > 0) {
        const insert = db.prepare(`
            INSERT INTO reports (id, organization_id, name, type, period_start, period_end, data_snapshot, file_url, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const r of existingReports) {
            insert.run(r.id, r.organization_id, r.name, r.type, r.period_start, r.period_end, r.data_snapshot, r.file_url, r.created_by, r.created_at);
        }
    }

    // 2. Fix Targets Table
    console.log('Fixing targets table...');
    const existingTargets = db.prepare("SELECT * FROM targets").all();
    db.exec("DROP TABLE targets");

    db.exec(`
        CREATE TABLE targets (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        metric_id TEXT,
        category TEXT,
        name TEXT NOT NULL,
        target_value REAL NOT NULL,
        baseline_year INTEGER NOT NULL,
        target_year INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (metric_id) REFERENCES metrics(id)
        );
    `);

    // Restore data if any
    if (existingTargets.length > 0) {
        const insert = db.prepare(`
            INSERT INTO targets (id, organization_id, metric_id, category, name, target_value, baseline_year, target_year, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const t of existingTargets) {
            insert.run(t.id, t.organization_id, t.metric_id, t.category, t.name, t.target_value, t.baseline_year, t.target_year, t.created_at);
        }
    }

})();

console.log('Schema repair successful!');

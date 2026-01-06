const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
console.log(`Migrating database at ${dbPath}...`);

const db = new Database(dbPath);

try {
  // Disable Foreign Keys for the migration duration
  db.pragma('foreign_keys = OFF');

  db.transaction(() => {
    
    // 1. Create Organizations
    db.exec(`
        CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        subscription_plan TEXT DEFAULT 'FREE',
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Default Org
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get().count;
    let defaultOrgId;
    if (orgCount === 0) {
        defaultOrgId = randomUUID();
        console.log(`Creating default organization: Demo Company (${defaultOrgId})`);
        db.prepare(`
        INSERT INTO organizations (id, name, industry, subscription_plan)
        VALUES (?, ?, ?, ?)
        `).run(defaultOrgId, 'Demo Company', 'Technology', 'PRO');
    } else {
        defaultOrgId = db.prepare('SELECT id FROM organizations LIMIT 1').get().id;
        console.log(`Using existing organization: ${defaultOrgId}`);
    }

    // --- RECREATE USERS ---
    console.log('Migrating users...');
    const hasUsersOld = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users_old'").get();
    if (!hasUsersOld) { 
        db.exec("ALTER TABLE users RENAME TO users_old");
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('GLOBAL_ADMIN', 'ADMIN', 'CONTRIBUTOR', 'VIEWER')) NOT NULL DEFAULT 'CONTRIBUTOR',
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
        );
    `);

    // Copy data
    const usersCols = db.prepare("PRAGMA table_info(users_old)").all().map(c => c.name);
    if (usersCols.includes('organization_id')) {
        db.exec(`INSERT INTO users (id, organization_id, email, password_hash, role, name, created_at, updated_at) 
                 SELECT id, organization_id, email, password_hash, role, name, created_at, updated_at FROM users_old`);
    } else {
        db.prepare(`INSERT INTO users (id, organization_id, email, password_hash, role, name, created_at, updated_at) 
                 SELECT id, ?, email, password_hash, role, name, created_at, updated_at FROM users_old`).run(defaultOrgId);
    }
    
    // --- RECREATE METRICS ---
    console.log('Migrating metrics...');
    const hasMetricsOld = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='metrics_old'").get();
    if (!hasMetricsOld) {
        db.exec("ALTER TABLE metrics RENAME TO metrics_old");
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        unit TEXT NOT NULL,
        emission_factor REAL DEFAULT 0,
        category TEXT,
        type TEXT DEFAULT 'NUMERIC',
        frequency TEXT DEFAULT 'MONTHLY',
        is_custom BOOLEAN DEFAULT 1,
        description TEXT,
        framework_tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
        );
    `);

    // Copy data
    db.prepare(`
        INSERT INTO metrics (id, organization_id, name, code, unit, category, description, created_at)
        SELECT id, ?, name, code, unit, category, description, created_at FROM metrics_old
    `).run(defaultOrgId);


    // --- RECREATE ENTRIES (Values) ---
    console.log('Migrating entries...');
    const hasEntriesOld = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='entries_old'").get();
    if (!hasEntriesOld) {
        db.exec("ALTER TABLE entries RENAME TO entries_old");
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        metric_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        value TEXT NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        calculated_emission REAL DEFAULT 0,
        status TEXT CHECK(status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')) DEFAULT 'DRAFT',
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (metric_id) REFERENCES metrics(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    const entriesCols = db.prepare("PRAGMA table_info(entries_old)").all().map(c => c.name);
    if (entriesCols.includes('period_start')) {
         db.exec(`
            INSERT INTO entries (id, organization_id, metric_id, user_id, value, period_start, period_end, calculated_emission, status, comments, created_at, updated_at)
            SELECT id, organization_id, metric_id, user_id, value, period_start, period_end, calculated_emission, 
            CASE status WHEN 'PENDING' THEN 'DRAFT' ELSE status END, 
            comments, created_at, updated_at 
            FROM entries_old
        `);
    } else {
        db.prepare(`
            INSERT INTO entries (id, organization_id, metric_id, user_id, value, period_start, period_end, calculated_emission, status, created_at, updated_at)
            SELECT id, ?, metric_id, user_id, value, date, date, calculated_emission, 
            CASE status WHEN 'PENDING' THEN 'DRAFT' ELSE status END,
            created_at, updated_at
            FROM entries_old
        `).run(defaultOrgId);
    }
    
    // --- RECREATE AUDIT LOGS ---
    console.log('Migrating audit_logs...');
    const hasAuditOld = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs_old'").get();
    if (!hasAuditOld) {
        db.exec("ALTER TABLE audit_logs RENAME TO audit_logs_old");
    }
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          organization_id TEXT,
          user_id TEXT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL, 
          entity_id TEXT,
          details TEXT, 
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organization_id) REFERENCES organizations(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
    
    const auditCols = db.prepare("PRAGMA table_info(audit_logs_old)").all().map(c => c.name);
    if (auditCols.includes('organization_id')) {
         db.exec(`
            INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details, timestamp)
            SELECT id, organization_id, user_id, action, entity_type, entity_id, details, timestamp FROM audit_logs_old
        `);
    } else {
         // Default logic: Assign to default Org, set entity_id/type to null/defaults
         db.prepare(`
            INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details, timestamp)
            SELECT id, ?, user_id, action, 'UNKNOWN', NULL, details, timestamp FROM audit_logs_old
        `).run(defaultOrgId);
    }

    // --- NEW TABLES ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS emission_factors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT,
        unit TEXT NOT NULL,
        factor_value REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS targets (
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

    db.exec(`
        CREATE TABLE IF NOT EXISTS reports (
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

    // --- CLEANUP ---
    console.log('Cleaning up old tables...');
    db.exec("DROP TABLE IF EXISTS entries_old");
    db.exec("DROP TABLE IF EXISTS audit_logs_old");
    db.exec("DROP TABLE IF EXISTS metrics_old");
    db.exec("DROP TABLE IF EXISTS users_old");

  })(); // End Transaction
  
  // Re-enable Foreign Keys
  db.pragma('foreign_keys = ON');

  console.log('Migration to Phase 2 successful!');

} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}

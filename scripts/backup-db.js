const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../greenmetrics.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `greenmetrics-${timestamp}.db`);

try {
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`✅ Database backed up to: ${backupPath}`);
} catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
}

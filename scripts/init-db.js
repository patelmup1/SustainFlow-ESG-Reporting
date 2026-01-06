const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/db/greenmetrics.db');
const schemaPath = path.join(__dirname, '../src/db/schema.sql');

console.log(`Initializing database at ${dbPath}...`);

try {
  const db = new Database(dbPath);
  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);
  console.log('Database initialized successfully.');
  
  // Seed initial Admin if not exists
  const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@greenmetrics.com');
  if (!adminExists) {
      console.log('Seeding default admin...');
      const bcrypt = require('bcryptjs');
      const { randomUUID } = require('crypto');
      // Default password: 'admin'
      const hash = bcrypt.hashSync('admin', 10);
      const stmt = db.prepare("INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)");
      stmt.run(randomUUID(), 'admin@greenmetrics.com', hash, 'ADMIN', 'System Admin');
      console.log('Default admin seeded (admin@greenmetrics.com / admin)');
  }

  // Seed sample metrics
  const count = db.prepare("SELECT COUNT(*) as count FROM metrics").get();
  if (count.count === 0) {
      console.log('Seeding sample metrics...');
      const { randomUUID } = require('crypto');
      const insertMetric = db.prepare("INSERT INTO metrics (id, name, code, unit, emission_factor, category) VALUES (?, ?, ?, ?, ?, ?)");
      
      insertMetric.run(randomUUID(), 'Electricity Usage', 'electricity', 'kWh', 0.5, 'Energy');
      insertMetric.run(randomUUID(), 'Diesel Consumption', 'diesel', 'Liters', 2.68, 'Energy');
      insertMetric.run(randomUUID(), 'Gender Diversity', 'gender_diversity', '%', 0, 'Social');
  }

  db.close();
} catch (err) {
  console.error('Error initializing database:', err);
  process.exit(1);
}

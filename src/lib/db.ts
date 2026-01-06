import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/db/greenmetrics.db');

const db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'development' ? console.log : undefined });

export default db;

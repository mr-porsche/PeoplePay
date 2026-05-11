import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database | undefined;
let currentPath: string | undefined;

export function getDb(): Database.Database {
  const dbPath= process.env.DB_PATH || path.join(__dirname, '../../data/peoplepay.db');
  
  if (!db || currentPath !== dbPath) {
    if (db) db.close();
    db = new Database(dbPath);
    currentPath = dbPath;
    
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined;
    currentPath = undefined;
  }
}

export function resetDb(): void {
  closeDb();
}
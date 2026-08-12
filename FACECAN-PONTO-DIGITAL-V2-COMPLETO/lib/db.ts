import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, "facecan.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  entry_start TEXT NOT NULL,
  entry_end TEXT NOT NULL,
  break_start TEXT,
  break_end TEXT,
  exit_start TEXT NOT NULL,
  exit_end TEXT NOT NULL,
  crosses_midnight INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT DEFAULT '',
  shift_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ATIVO',
  face_status TEXT NOT NULL DEFAULT 'PENDENTE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'TERMINAL',
  device_id TEXT DEFAULT '',
  confidence REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECEBIDO',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

const count = db.prepare("SELECT COUNT(*) as n FROM shifts").get() as {n:number};
if (count.n === 0) {
  const insert = db.prepare(`
    INSERT INTO shifts
    (name,entry_start,entry_end,break_start,break_end,exit_start,exit_end,crosses_midnight)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  insert.run("MANHÃ", "06:00", "11:00", "12:00", "13:30", "17:00", "18:00", 0);
  insert.run("NOITE", "18:00", "22:00", null, null, "01:20", "07:00", 1);
}

const employees = db.prepare("SELECT COUNT(*) as n FROM employees").get() as {n:number};
if (employees.n === 0) {
  const morning = db.prepare("SELECT id FROM shifts WHERE name='MANHÃ'").get() as {id:number};
  const night = db.prepare("SELECT id FROM shifts WHERE name='NOITE'").get() as {id:number};
  const insert = db.prepare(
    "INSERT INTO employees(registration,name,department,shift_id,face_status) VALUES(?,?,?,?,?)"
  );
  insert.run("0001", "Funcionário Demonstração", "Operações", morning.id, "PENDENTE");
  insert.run("0002", "Funcionário Noturno", "Operações", night.id, "PENDENTE");
}

export default db;

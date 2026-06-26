import Database from "better-sqlite3";

const db = new Database("events.db");

// tabela dos eventos
db.exec(`
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    event TEXT NOT NULL,
    people_inside INTEGER NOT NULL,
    total_entries INTEGER NOT NULL,
    total_exits INTEGER NOT NULL,
    source TEXT NOT NULL
)
`);

// tabela dos utilizadores
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
`);

export { db };
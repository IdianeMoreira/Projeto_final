import Database from "better-sqlite3";

const db = new Database("events.db");

// Cria tabela se não existir
db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event TEXT NOT NULL,
        people_inside INTEGER NOT NULL,
        total_entries INTEGER NOT NULL,
        total_exits INTEGER NOT NULL
    )
`);

export default db;
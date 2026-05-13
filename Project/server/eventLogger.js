import db from "./database.js";

export function logEvent(data) {

    // Prepara a inserção o evento na base de dados
    const stmt = db.prepare(`
        INSERT INTO events (
            timestamp,
            event,
            people_inside,
            total_entries,
            total_exits
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    // Executa a inserção
    stmt.run(
        data.timestamp,
        data.event,
        data.people_inside,
        data.total_entries,
        data.total_exits
    );

    console.log("Event saved to database");
}
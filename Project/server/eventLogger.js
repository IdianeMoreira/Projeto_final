import { db } from "./database.js";

export function logEvent(data, source = "mqtt") {

    // Verifica se já existe evento igual nos últimos 10 segundos
    // para evitar duplicados quando ambos chegam
    const existing = db.prepare(`
        SELECT id FROM events
        WHERE event = ?
        AND total_entries = ?
        AND total_exits = ?
        AND ABS(
            strftime('%s', timestamp) -
            strftime('%s', ?)
        ) < 10
    `).get(
        data.event,
        data.total_entries,
        data.total_exits,
        data.timestamp
    );

    if (existing) {
        console.log(`Duplicate event ignored (source: ${source})`);
        return;
    }

    const stmt = db.prepare(`
        INSERT INTO events (
            timestamp,
            event,
            people_inside,
            total_entries,
            total_exits,
            source
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
    data.timestamp,
    data.event,
    data.people_inside,
    data.total_entries,
    data.total_exits,
    source
    );

console.log("INSERT RESULT:", result);

    console.log(`Event saved (source: ${source})`);
}
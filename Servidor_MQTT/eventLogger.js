import fs from "fs";

const MAX_EVENTS = 100;
let eventCount = 0;

const filePath = "events.csv";

// Escreve o cabeçalho do ficheiro CSV
fs.writeFileSync(filePath, "timestamp;event;people_inside;total_entries;total_exits\n");

export function logEvent(data) {

    if (eventCount >= MAX_EVENTS) return;

    const line =
        `${data.timestamp};${data.event};${data.people_inside};${data.total_entries};${data.total_exits}\n`;

    fs.appendFileSync(filePath, line);

    eventCount++;

    console.log(`Event logged (${eventCount}/${MAX_EVENTS})`);
}
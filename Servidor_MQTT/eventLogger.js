import fs from "fs";

const MAX_EVENTS = 100;
let eventCount = 0;

const filePath = "events.csv";

// Escreve o cabeçalho do ficheiro CSV
fs.writeFileSync(filePath, "device,timestamp,event,count,dist_A,dist_B\n");

export function logEvent(data) {

    if (eventCount >= MAX_EVENTS) return;

    const distA = data.sensor_A ?? -1;
    const distB = data.sensor_B ?? -1;

    const line =
        `${data.device},${data.timestamp},${data.event},${data.count},${distA},${distB}\n`;

    fs.appendFileSync(filePath, line);

    eventCount++;

    console.log(`Event logged (${eventCount}/${MAX_EVENTS})`);
}
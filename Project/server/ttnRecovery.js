import dotenv from "dotenv";

dotenv.config();

import { db } from "./database.js";

const TTN_APP_ID = "smart-occupancy";
const TTN_API_KEY = process.env.TTN_API_KEY;

db.exec(`
    CREATE TABLE IF NOT EXISTS system_state(
        id INTEGER PRIMARY KEY,
        last_ttn_timestamp TEXT
    )
`);

export function saveLastTTN(ts) {

    db.prepare(`
        INSERT OR REPLACE INTO system_state
        VALUES (1, ?)
    `).run(ts);
}

export function loadLastTTN() {

    return db
        .prepare(`
            SELECT last_ttn_timestamp
            FROM system_state
            WHERE id=1
        `)
        .get()?.last_ttn_timestamp;
}

export async function recoverMessages(after) {

    console.log(
        "Recovering after:",
        after
    );

    const url =
        `https://eu1.cloud.thethings.network/api/v3/as/applications/${TTN_APP_ID}/packages/storage/uplink_message?after=${encodeURIComponent(after)}`;

    const response =
        await fetch(url, {
            headers: {
                Authorization:
                    `Bearer ${TTN_API_KEY}`
            }
        });

    const text =
        await response.text();

    const messages =
        text
            .trim()
            .split("\n")
            .map(line => JSON.parse(line).result);

    return messages;
}


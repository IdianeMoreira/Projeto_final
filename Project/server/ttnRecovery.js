import dotenv from "dotenv";

dotenv.config();

import { db } from "./database.js";

const TTN_APP_ID = "smart-occupancy";
const TTN_API_KEY = process.env.TTN_API_KEY;

// Cria a tabela system_state se não existir, para armazenar o último timestamp TTN.
db.exec(`
    CREATE TABLE IF NOT EXISTS system_state(
        id INTEGER PRIMARY KEY,
        last_ttn_timestamp TEXT
    )
`);

// Guarda o último timestamp TTN na base de dados para persistência entre reinicializações do servidor.
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

// Recupera mensagens do TTN após um determinado timestamp.
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
 
    if (!response.ok) {
        console.warn(
            `TTN recovery skipped: HTTP ${response.status} (${response.statusText}). ` +
            "Verifica a ligação à gateway/TTN e o TTN_API_KEY."
        );
        return [];
    }
 
    const text =
        await response.text();
 
    if (!text || !text.trim()) {
        console.log(
            "Nenhuma mensagem para recuperar (resposta vazia - provavelmente sem ligação à gateway ou sem mensagens novas)."
        );
        return [];
    }
 
    const messages = [];
 
    for (const line of text.trim().split("\n")) {
 
        if (!line.trim())
            continue;
 
        try {
            messages.push(JSON.parse(line).result);
        }
        catch (err) {
            console.error(
                "Linha de recovery TTN ignorada (JSON inválido):",
                err.message
            );
        }
    }
 
    return messages;
}


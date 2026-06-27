import { updateLastMessageTime } from "./systemState.js";
import { updateLastTTNTimestamp } from "./systemState.js";

import { saveLastTTN } from "./ttnRecovery.js";

import { logEvent } from "./eventLogger.js";

// Converte uma data UTC para o formato "YYYY-MM-DD HH:MM:SS" na hora local de Lisboa,
// ajustando automaticamente para horário de verão/inverno (WEST/WET)
function toLisbonTimestamp(date) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Lisbon",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false
    });

    const parts = formatter.formatToParts(date);
    const get = (type) => parts.find(p => p.type === type).value;

    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

// Processa uma mensagem recebida do TTN (The Things Network) e extrai informações relevantes para registro de eventos.
function processTTNMessage(body) {

    const base64 =
        body?.uplink_message?.frm_payload;

    if (!base64)
        return false;

    const decoded =
        Buffer
            .from(base64, "base64")
            .toString("utf8");

    console.log(
        "TTN payload:",
        decoded
    );

    const parts =
        decoded.split(",");

    if (parts.length !== 4)
        return false;

    const [
        eventCode,
        peopleInside,
        totalEntries,
        totalExits
    ] = parts;

    const event =
        eventCode === "E"
            ? "entry"
            : "exit";

    const ttnTimestamp =
        body.uplink_message.received_at;

    const timestamp =
        toLisbonTimestamp(
            new Date(ttnTimestamp)
        );

    updateLastMessageTime();
    updateLastTTNTimestamp(ttnTimestamp);
    saveLastTTN(ttnTimestamp);

    logEvent({
        timestamp,
        event,
        people_inside:
            parseInt(peopleInside),

        total_entries:
            parseInt(totalEntries),

        total_exits:
            parseInt(totalExits)
    }, "lora");

    return true;
}

export { toLisbonTimestamp, processTTNMessage };
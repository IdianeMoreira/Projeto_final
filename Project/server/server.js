import dotenv from "dotenv";

dotenv.config();

console.log("Current directory:", process.cwd());
console.log("TTN KEY:", process.env.TTN_API_KEY);

import express from "express";
import cors from "cors";
import mqtt from "mqtt";

import apiRoutes from "./routes/webapi.js";
import userRoutes from "./routes/users.js";
import { updateDeviceStatus } from "./deviceStatus.js";

import { logEvent } from "./eventLogger.js";
import { updateLastMessageTime } from "./systemState.js";

const app = express();

// TTN MQTT
const TTN_APP_ID = "smart-occupancy";
const TTN_API_KEY = process.env.TTN_API_KEY;
console.log("TTN KEY:", TTN_API_KEY?.substring(0,10));
const TTN_SERVER = "mqtts://eu1.cloud.thethings.network:8883";

// Configura o servidor Express
app.use(cors());
app.use(express.json());

// Regista as rotas da API
app.use("/api", apiRoutes);
app.use("/api", userRoutes);

const PORT = 3000;

// Configurações do MQTT
const BROKER = "mqtt://broker.hivemq.com";
const TOPIC = "sensor/m5stick/#";

const client = mqtt.connect(BROKER);

const ttnClient = mqtt.connect(TTN_SERVER, {
    username: `${TTN_APP_ID}@ttn`,
    password: TTN_API_KEY
});

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

// Conecta o servidor ao broker MQTT e se inscreve no tópico
client.on("connect", () => {
  	console.log("Connected to MQTT broker");

  	client.subscribe(TOPIC, (err) => {
		if (err) {
			console.error("Subscribe error:", err);
		} else {
			console.log(`Subscribed to topic: ${TOPIC}`);
		}
  	});
});

// Recebe mensagens do tópico e processa os dados
client.on("message", (topic, message) => {

    try {

        const data = JSON.parse(message.toString());

        if (topic === "sensor/m5stick/status") {

            console.log("Status received:", data);

            updateDeviceStatus(data);

        }
        else if (topic === "sensor/m5stick/dual_tof") {

            console.log("Event received:", data);

            updateLastMessageTime();

            logEvent(data);

        }

    }
    catch (err) {

        console.error("Invalid JSON:", err);

    }

});

// Conecta ao TTN MQTT e se inscreve no tópico de uplinks
ttnClient.on("connect", () => {

    try {
        if (!TTN_API_KEY) {
            throw new Error(
                "TTN_API_KEY not defined"
            );
        }

        console.log("Connected to TTN MQTT");

        ttnClient.subscribe(
            `v3/${TTN_APP_ID}@ttn/devices/+/up`,
            err => {

                if (err)
                    console.error(err);
                else
                    console.log("Subscribed to TTN uplinks");
            }
        );
    }
    catch (err) {
        console.error("TTN MQTT error:", err);
    }
});

// Recebe mensagens do TTN MQTT e processa os dados
ttnClient.on("message", (topic, message) => {

    try {

        const body =
            JSON.parse(message.toString());

        const base64 =
            body?.uplink_message?.frm_payload;

        if (!base64)
            return;

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
            return;

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

        const timestamp =
            body?.received_at
                ? toLisbonTimestamp(
                    new Date(body.uplink_message.received_at)
                  )
                : toLisbonTimestamp(
                    new Date()
                  );

        updateLastMessageTime();

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

    }
    catch(err) {

        console.error(
            "TTN MQTT error:",
            err
        );
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
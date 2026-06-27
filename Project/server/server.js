import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import mqtt from "mqtt";

import apiRoutes from "./routes/webapi.js";
import userRoutes from "./routes/users.js";
import { updateDeviceStatus, updateLoRaStatus } from "./deviceStatus.js";

import { logEvent } from "./eventLogger.js";
import { updateLastMessageTime } from "./systemState.js";
import { updateLastTTNTimestamp } from "./systemState.js";
import { saveLastTTN, loadLastTTN, recoverMessages } from "./ttnRecovery.js";
import { toLisbonTimestamp, processTTNMessage } from "./utils.js";

const app = express();

// TTN MQTT
const TTN_APP_ID = "smart-occupancy";
const TTN_API_KEY = process.env.TTN_API_KEY;
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

        updateLoRaStatus();

        processTTNMessage(body);

    }
    catch(err) {

        console.error(
            "TTN MQTT error:",
            err
        );
    }
});

// Guarda o último timestamp do TTN no banco de dados e carrega-o na inicialização do servidor
const lastTimestamp = loadLastTTN();
console.log("Last TTN timestamp loaded:", lastTimestamp);

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Recupera mensagens do TTN após o último timestamp salvo
    if (lastTimestamp) {

        try {

            const messages =
                await recoverMessages(
                    lastTimestamp
                );

            console.log(
                "Recovered",
                messages.length,
                "messages"
            );

            for (const body of messages) {

                processTTNMessage(body);

            }
        }
        catch(err) {

            console.error(
                "Recovery error:",
                err
            );
        }
    }
});
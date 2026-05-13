import express from "express";
import cors from "cors";
import mqtt from "mqtt";

import apiRoutes from "./routes/webapi.js";

import { logEvent } from "./eventLogger.js";
import { updateLastMessageTime } from "./systemState.js";

const app = express();

// Configura o servidor Express
app.use(cors());
app.use(express.json());

// Regista as rotas da API
app.use("/api", apiRoutes);

const PORT = 3000;

// Configurações do MQTT
const BROKER = "mqtt://broker.hivemq.com";
const TOPIC = "sensor/m5stick/#";

const client = mqtt.connect(BROKER);

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

		console.log("Event received:", data);

		updateLastMessageTime(); // Atualiza o timestamp do último evento recebido

		logEvent(data); // Loga o evento na base de dados
	} catch (err) {
		console.error("Invalid JSON:", err);
	}
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
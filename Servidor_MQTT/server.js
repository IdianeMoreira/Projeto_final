import mqtt from "mqtt";
import { logEvent } from "./eventLogger.js";

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

		logEvent(data); // Loga o evento no ficheiro CSV
	} catch (err) {
		console.error("Invalid JSON:", err);
	}
});
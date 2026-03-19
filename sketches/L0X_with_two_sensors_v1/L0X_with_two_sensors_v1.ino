#include <M5StickCPlus2.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_VL53L0X.h>
#include <time.h>

// WiFi
const char* SSID = "ZON-0770";
const char* PASS = "ddb8d7a757cb";

// MQTT
const char* MQTT_SERVER = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "sensor/m5stick/dual_tof";

WiFiClient espClient;
PubSubClient client(espClient);

// Sensores
Adafruit_VL53L0X lox1;
Adafruit_VL53L0X lox2;

// Seleção de canal no PaHUB (0x70)
void pabhubSelectChannel(uint8_t channel) {
  Wire.beginTransmission(0x70);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

// WiFi
void wifiConnect() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);

  Serial.print("A ligar ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi ligado!");
}

// MQTT
void mqttConnect() {
  while (!client.connected()) {
    Serial.print("A ligar ao MQTT...");
    if (client.connect("m5stick-client")) {
      Serial.println("ligado!");
    } else {
      Serial.print("erro=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup() {
  M5.begin();
  Serial.begin(115200);
  Wire.begin();

  Serial.println("Inicializar sensores...");

  // Sensor A (canal 0)
  pabhubSelectChannel(0);
  if (!lox1.begin()) {
    Serial.println("Erro Sensor A");
    while (1);
  }

  // Sensor B (canal 1)
  pabhubSelectChannel(1);
  if (!lox2.begin()) {
    Serial.println("Erro Sensor B");
    while (1);
  }

  wifiConnect();

  client.setServer(MQTT_SERVER, MQTT_PORT);

  // NTP para timestamp
  configTime(0, 0, "pool.ntp.org");

  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(1000);
  }
}

void loop() {

  if (!client.connected()) {
    mqttConnect();
  }

  client.loop();

  VL53L0X_RangingMeasurementData_t m1, m2;

  // Ler Sensor A
  pabhubSelectChannel(0);
  lox1.rangingTest(&m1, false);

  // Ler Sensor B
  pabhubSelectChannel(1);
  lox2.rangingTest(&m2, false);

  // Processar valores
  int dist1 = (m1.RangeStatus != 4) ? m1.RangeMilliMeter : -1;
  int dist2 = (m2.RangeStatus != 4) ? m2.RangeMilliMeter : -1;

  // Timestamp
  struct tm timeinfo;
  getLocalTime(&timeinfo);

  char timestamp[30];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", &timeinfo);

  // JSON
  String payload = String("{") +
    "\"device\":\"m5stickcplus2\"," +
    "\"timestamp\":\"" + String(timestamp) + "\"," +
    "\"sensor_A\":{\"dist\":" + String(dist1) + ",\"status\":" + String(m1.RangeStatus) + "}," +
    "\"sensor_B\":{\"dist\":" + String(dist2) + ",\"status\":" + String(m2.RangeStatus) + "}" +
  "}";

  Serial.println(payload);

  // Enviar via MQTT
  client.publish(MQTT_TOPIC, payload.c_str());

  delay(500);
}
#include <M5StickCPlus2.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_VL53L0X.h>
#include <time.h>
#include <WiFiManager.h>
#include <queue>

// MQTT
const char* MQTT_SERVER = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "sensor/m5stick/dual_tof";
const char* MQTT_STATUS_TOPIC = "sensor/m5stick/status";

// QUEUE
std::queue<String> loraQueue;
bool loraBusy = false;
const int MAX_LORA_QUEUE = 20;

WiFiClient espClient;
PubSubClient client(espClient);

WiFiManager wifiManager;

// LoRaWAN
HardwareSerial rakSerial(1);
bool loraJoined = false;

// Sensores
Adafruit_VL53L0X lox1;
Adafruit_VL53L0X lox2;

// Config para deteção
const int MIN_VALID_MM = 50;
const int PERSON_MAX_MM = 1200;
const int TIMEOUT = 1000;

bool prevA = false;
bool prevB = false;

enum State {
  IDLE,
  A_TRIGGERED,
  B_TRIGGERED
};

State state = IDLE;

unsigned long lastTriggerTime = 0;
int peopleCount = 0;
int totalEntries = 0;
int totalExits = 0;

// Função para selecionar canal do PABHub
void pabhubSelectChannel(uint8_t channel) {
  Wire.beginTransmission(0x70);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

// Função para determinar se a distância indica presença de pessoa
bool personDetected(int dist) {
  return (dist >= MIN_VALID_MM && dist <= PERSON_MAX_MM);
}

// Função para criar timestamp
void createTimestamp(char* buffer, size_t size) {
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    strftime(buffer, size, "%Y-%m-%d %H:%M:%S", &timeinfo);
  } else {
    strcpy(buffer, "no_time");
  }
}

// LoRaWAN AT command helper
String sendAT(const char* cmd, int waitMs = 2000) {
  rakSerial.println(cmd);
  String response = "";
  unsigned long start = millis();
  while (millis() - start < waitMs) {
    if (rakSerial.available()) {
      char c = rakSerial.read();
      Serial.write(c);
      response += c;
    }
  }
  return response;
}

// Envia comando AT sem esperar resposta
void sendATNoWait(const char* cmd) {
  rakSerial.println(cmd);

  Serial.print("RAK TX: ");
  Serial.println(cmd);
}

// Enviar dados via LoRaWAN
void sendLoRa(const char* eventType) {

  if (!loraJoined) {
    Serial.println("LoRa not joined");
    return;
  }

  char payload[32];

  snprintf(
    payload,
    sizeof(payload),
    "%s,%d,%d,%d",
    strcmp(eventType, "entry") == 0 ? "E" : "X",
    peopleCount,
    totalEntries,
    totalExits
  );

  // converter para hexadecimal
  String hexPayload = "";

  for (size_t i = 0; i < strlen(payload); i++) {

    char hexByte[3];

    snprintf(
      hexByte,
      sizeof(hexByte),
      "%02X",
      (uint8_t)payload[i]
    );

    hexPayload += hexByte;
  }

  if (loraQueue.size() < MAX_LORA_QUEUE) {

      loraQueue.push(hexPayload);

      Serial.print("Queued LoRa: ");
      Serial.println(hexPayload);
  }
  else {

      Serial.println("LoRa queue full");
  }
}

void processLoRaQueue() {

    if (!loraJoined)
        return;

    if (loraBusy)
        return;

    if (loraQueue.empty())
        return;

    String payload = loraQueue.front();
    loraQueue.pop();

    char cmd[80];

    snprintf(
        cmd,
        sizeof(cmd),
        "AT+SEND=1:%s",
        payload.c_str()
    );

    Serial.print("Sending LoRa: ");
    Serial.println(cmd);

    loraBusy = true;

    sendATNoWait(cmd);
}

// Enviar evento MQTT + LoRaWAN
void sendEvent(const char* eventType) {
  char timestamp[30];
  createTimestamp(timestamp, sizeof(timestamp));

  String payload = String("{") +
    "\"timestamp\":\"" + String(timestamp) + "\"," +
    "\"event\":\"" + eventType + "\"," +
    "\"people_inside\":" + String(peopleCount) + "," +
    "\"total_entries\":" + String(totalEntries) + "," +
    "\"total_exits\":" + String(totalExits) +
  "}";

  Serial.println(payload);

  if (client.connected()) {
    client.publish(MQTT_TOPIC, payload.c_str());
  }

  sendLoRa(eventType);
}

// Enviar status MQTT
void sendStatus() {
  String payload =
    String("{") +
    "\"wifi\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") +
    ",\"mqtt\":" + String(client.connected() ? "true" : "false") +
    ",\"lora\":" + String(loraJoined ? "true" : "false") +
    ",\"battery\":" + String(M5.Power.getBatteryLevel()) +
    "}";

  Serial.print("STATUS -> ");
  Serial.println(payload);

  if (client.connected()) {
    client.publish(MQTT_STATUS_TOPIC, payload.c_str());
  }
}

// Lê respostas do RAK sem bloquear
void checkLoRaResponses() {

  while (rakSerial.available()) {

    
    String line =
        rakSerial.readStringUntil('\n');

    line.trim();

    if (line.length() == 0)
        continue;

    Serial.print("RAK RX: ");
    Serial.println(line);

    // transmissão concluída
    if (line.indexOf("+EVT:TX_DONE") != -1) {

        Serial.println(
            "LoRa TX completed"
        );

        loraBusy = false;
    }

    // join OK
    if (line.indexOf("JOINED") != -1 ||
        line.indexOf("Join Success") != -1) {

        loraJoined = true;

        Serial.println(
            "LoRa joined."
        );
    }

    // join perdido
    if (line.indexOf("JOIN_FAILED") != -1) {

        loraJoined = false;
    }
  }
}

// Conectar ao MQTT
void mqttConnect() {
  while (WiFi.status() == WL_CONNECTED && !client.connected()) {
    Serial.print("Connecting MQTT...");

    if (client.connect("m5stick-client")) {
      Serial.println(" connected!");
      sendStatus();
    } else {
      Serial.print(" failed: ");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// Setup LoRaWAN
void setupLoRa() {
  Serial.println("Setting up LoRa...");
  rakSerial.begin(115200, SERIAL_8N1, 0, 26);

  Serial.println("Liga o G0 agora! A aguardar 10 segundos...");
  delay(10000);

  // Reconfigurar sempre, por segurança - caso o módulo tenha
  // perdido a configuração (reset de fábrica inesperado pelo G0)
  sendAT("AT+DEVEUI=70B3D57ED007828C");
  sendAT("AT+APPEUI=0000000000000000");
  sendAT("AT+APPKEY=08CEF571424F558C969ED035170B7569");

  String njs = sendAT("AT+NJS=?", 3000);
  Serial.println("----- NJS RESPONSE -----");
  Serial.println("[" + njs + "]");
  Serial.println("------------------------");

  if (njs.indexOf("AT+NJS=1") != -1 || njs.indexOf("NJS=1") != -1)
  {
    loraJoined = true;
    Serial.println("LoRa already joined.");
  }
  else {
    Serial.println("Joining LoRaWAN...");
    String joinResponse = sendAT("AT+JOIN=1:0:10:8", 20000);
    Serial.println("JOIN raw response: [" + joinResponse + "]");

    if (joinResponse.indexOf("JOINED") != -1 || joinResponse.indexOf("Join Success") != -1) {
      loraJoined = true;
      Serial.println("LoRa join OK!");
    } else {
      loraJoined = false;
      Serial.println("LoRa join FAILED.");
    }
  }

  Serial.println("LoRa setup done.");
}

// Função de display
void drawDisplay() {
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.setTextSize(2);

  // Ocupação
  M5.Lcd.setCursor(10, 15);
  M5.Lcd.printf("Ocupation: %d", peopleCount);

  // LoRa
  M5.Lcd.setCursor(10, 35);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.print("LoRa: ");
  if (loraJoined) {
    M5.Lcd.setTextColor(GREEN);
    M5.Lcd.println("OK");
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("OFF");
  }

  // WiFi
  M5.Lcd.setCursor(10, 55);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.print("WiFi: ");
  if (WiFi.status() == WL_CONNECTED) {
    M5.Lcd.setTextColor(GREEN);
    M5.Lcd.println("OK");
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("OFF");
  }

  // MQTT
  M5.Lcd.setCursor(10, 75);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.print("MQTT: ");
  if (client.connected()) {
    M5.Lcd.setTextColor(GREEN);
    M5.Lcd.println("OK");
  } else {
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("OFF");
  }

  // Bateria
  int battery = M5.Power.getBatteryLevel();
  M5.Lcd.setCursor(10, 95);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.print("Battery: ");
  if (battery > 30) {
    M5.Lcd.setTextColor(GREEN);
  } else if (battery > 15) {
    M5.Lcd.setTextColor(YELLOW);
  } else {
    M5.Lcd.setTextColor(RED);
  }
  M5.Lcd.printf("%d%%", battery);
}

// Setup
void setup() {
  M5.begin();
  M5.Lcd.setRotation(1);
  Serial.begin(115200);
  Wire.begin();

  Serial.println("Initializing sensors...");

  // Sensor A (canal 0)
  pabhubSelectChannel(0);
  if (!lox1.begin()) {
    Serial.println("Sensor A error");
    while (1);
  }

  // Sensor B (canal 5)
  pabhubSelectChannel(5);
  if (!lox2.begin()) {
    Serial.println("Sensor B error");
    while (1);
  }

  Serial.println("Connecting WiFi...");

  wifiManager.setAPCallback([](WiFiManager* wm) {
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setTextColor(YELLOW);
    M5.Lcd.setTextSize(2);
    M5.Lcd.setCursor(10, 15);
    M5.Lcd.println("Setup WiFi:");
    M5.Lcd.setCursor(10, 45);
    M5.Lcd.println("1. Connect to:");
    M5.Lcd.setCursor(10, 65);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.println("SmartOccupancy");
    M5.Lcd.setCursor(10, 85);
    M5.Lcd.setTextColor(YELLOW);
    M5.Lcd.println("2. Open:");
    M5.Lcd.setCursor(10, 105);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.println("192.168.4.1");
  });

  wifiManager.setConfigPortalTimeout(180);

  if (!wifiManager.autoConnect("SmartOccupancy_Setup")) {
    Serial.println("Failed to connect WiFi");
    ESP.restart();
  }

  Serial.println("WiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  client.setServer(MQTT_SERVER, MQTT_PORT);

  // NTP com DST automático para Portugal (WET/WEST)
  configTime(0, 0, "pool.ntp.org");  // primeiro sincroniza em UTC puro
  setenv("TZ", "WET0WEST,M3.5.0/1,M10.5.0/2", 1);
  tzset();  // aplica a regra de fuso horário com DST automático

  struct tm timeinfo;
  unsigned long ntpStart = millis();

  while (!getLocalTime(&timeinfo) && millis() - ntpStart < 5000) {
    delay(500);
    Serial.println("Waiting for NTP...");
  }

  if (getLocalTime(&timeinfo)) {
    Serial.println("Time synchronized.");
  } else {
    Serial.println("NTP sync failed.");
  }

  setupLoRa();

  Serial.println("System ready.");
}

// Loop
void loop() {
  M5.update();

  if (M5.BtnA.wasPressed()) {
    Serial.println("Reset WiFi settings");
    wifiManager.resetSettings();
    delay(1000);
    ESP.restart();
  }

  if (!client.connected()) {
    mqttConnect();
  }
  client.loop();

  // verificar respostas do RAK sem bloquear
  checkLoRaResponses();

  processLoRaQueue();

  VL53L0X_RangingMeasurementData_t m1, m2;

  pabhubSelectChannel(0);
  lox1.rangingTest(&m1, false);

  pabhubSelectChannel(5);
  lox2.rangingTest(&m2, false);

  int dist1 = (m1.RangeStatus != 4) ? m1.RangeMilliMeter : -1;
  int dist2 = (m2.RangeStatus != 4) ? m2.RangeMilliMeter : -1;

  bool currA = personDetected(dist1);
  bool currB = personDetected(dist2);

  bool trigA = (!prevA && currA);
  bool trigB = (!prevB && currB);

  prevA = currA;
  prevB = currB;

  unsigned long now = millis();
  /*
  Serial.print("A: ");
  Serial.print(dist1);
  Serial.print(" mm | B: ");
  Serial.print(dist2);
  Serial.print(" mm | trigA=");
  Serial.print(trigA);
  Serial.print(" | trigB=");
  Serial.println(trigB); */

  switch (state) {
    case IDLE:
      if (trigA) {
        state = A_TRIGGERED;
        lastTriggerTime = now;
      } else if (trigB) {
        state = B_TRIGGERED;
        lastTriggerTime = now;
      }
      break;

    case A_TRIGGERED:
      if (trigB) {
        peopleCount++;
        totalEntries++;
        sendEvent("entry");
        state = IDLE;
      }
      if (now - lastTriggerTime > TIMEOUT) {
        state = IDLE;
      }
      break;

    case B_TRIGGERED:
      if (trigA) {
        if (peopleCount > 0) peopleCount--;
        totalExits++;
        sendEvent("exit");
        state = IDLE;
      }
      if (now - lastTriggerTime > TIMEOUT) {
        state = IDLE;
      }
      break;
  }

  static unsigned long lastDisplayUpdate = 0;
  if (millis() - lastDisplayUpdate > 500) {
    drawDisplay();
    lastDisplayUpdate = millis();
  }

  static unsigned long lastStatus = 0;
  if (client.connected() && millis() - lastStatus > 10000) {
    sendStatus();
    lastStatus = millis();
  }

  delay(5);
}

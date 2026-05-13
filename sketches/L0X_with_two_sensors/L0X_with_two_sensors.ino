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

// Config para deteção
const int MIN_VALID_MM = 50;       // ignora leituras demasiado próximas / ruído
const int PERSON_MAX_MM = 1200;    // distância máxima para considerar "pessoa"
const int TIMEOUT = 1000;          // ms entre ativação de A e B

bool prevA = false;
bool prevB = false;

// Máquina de estados para detetar direção
enum State {
  IDLE,
  A_TRIGGERED,
  B_TRIGGERED
};

State state = IDLE;

unsigned long lastTriggerTime = 0; // 
int peopleCount = 0; // contador de pessoas atualmente presentes
int totalEntries = 0; // contador total de entradas
int totalExits = 0; // contador total de saídas

// Função para selecionar canal do PABHub
void pabhubSelectChannel(uint8_t channel) {
  Wire.beginTransmission(0x70);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

// Conectar ao WiFi
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

// Conectar ao MQTT
void mqttConnect() {
  while (!client.connected()) {
    Serial.print("A ligar ao MQTT...");
    if (client.connect("m5stick-client")) {
      Serial.println(" ligado!");
    } else {
      Serial.print(" erro=");
      Serial.println(client.state());
      delay(2000);
    }
  }
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

// Função para enviar evento MQTT
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
}

// Setup
void setup() {
  M5.begin(); // Inicializa o M5StickC Plus 2
  Serial.begin(115200); 
  Wire.begin(); // Inicializa I2C

  Serial.println("Inicializar sensores...");

  // Sensor A (canal 0)
  pabhubSelectChannel(0);
  if (!lox1.begin()) {
    Serial.println("Erro Sensor A");
    while (1);
  }

  // Sensor B (canal 5)
  pabhubSelectChannel(5);
  if (!lox2.begin()) {
    Serial.println("Erro Sensor B");
    while (1);
  }

  wifiConnect();
  client.setServer(MQTT_SERVER, MQTT_PORT); // Configura MQTT

  // NTP
  configTime(0, 3600, "pool.ntp.org");

  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(1000);
  }

  Serial.println("Sistema pronto.");
}

// Loop
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
  pabhubSelectChannel(5);
  lox2.rangingTest(&m2, false);

  // Distâncias
  int dist1 = (m1.RangeStatus != 4) ? m1.RangeMilliMeter : -1;
  int dist2 = (m2.RangeStatus != 4) ? m2.RangeMilliMeter : -1;

  // Verificar se a pessoa foi detectada por cada sensor
  bool currA = personDetected(dist1);
  bool currB = personDetected(dist2);

  // Ativar triggers apenas na transição de "não detectado" para "detectado"
  bool trigA = (!prevA && currA);
  bool trigB = (!prevB && currB);

  // Atualizar estados anteriores para a próxima iteração
  prevA = currA;
  prevB = currB;

  unsigned long now = millis();

  // Debug no Serial
  Serial.print("A: ");
  Serial.print(dist1);
  Serial.print(" mm | B: ");
  Serial.print(dist2);
  Serial.print(" mm | trigA=");
  Serial.print(trigA);
  Serial.print(" | trigB=");
  Serial.println(trigB);

  // Máquina de estados para detetar direção
  switch (state) {
    // Estado inicial: espera por trigger em A ou B
    case IDLE:
      if (trigA) {
        state = A_TRIGGERED;
        lastTriggerTime = now;
      }
      else if (trigB) {
        state = B_TRIGGERED;
        lastTriggerTime = now;
      }
      break;

    // Se A foi ativado, espera por B para confirmar entrada
    case A_TRIGGERED:
      if (trigB) {
        peopleCount++;
        totalEntries++;

        sendEvent("entry");

        state = IDLE; // reset para próxima detecção
      }

      // Se passar muito tempo sem confirmação, volta para IDLE
      if (now - lastTriggerTime > TIMEOUT) {
        state = IDLE;
      }
      break;

    // Se B foi ativado, espera por A para confirmar saída
    case B_TRIGGERED:
      if (trigA) {
        if (peopleCount > 0) {
          peopleCount--;
        }
        totalExits++;

        sendEvent("exit");

        state = IDLE; // reset para próxima detecção
      }
      
      if (now - lastTriggerTime > TIMEOUT) {
        state = IDLE;
      }
      break;
  }

  delay(5);
}
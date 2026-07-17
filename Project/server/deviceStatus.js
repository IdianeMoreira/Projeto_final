// Estrutura para armazenar o estado do dispositivo
let deviceStatus = {
    wifi: false,
    mqtt: false,
    lora: false,
    battery: 0,

    lastStatusUpdate: null,
    lastLoRaUpdate: null
};

// Atualiza o estado do dispositivo com novos valores
export function updateDeviceStatus(newStatus) {

    deviceStatus = {
        ...deviceStatus,
        ...newStatus,
        lastStatusUpdate: Date.now()
    };
}

// Atualiza o estado do LoRa com novos valores
export function updateLoRaStatus() {

    deviceStatus.lora = true;
    deviceStatus.lastLoRaUpdate = Date.now();
}

// Retorna o estado atual do dispositivo, considerando a última atualização e os tempos limite para determinar se está offline
export function getDeviceStatus() {

    const mqttOffline =
        !deviceStatus.lastStatusUpdate ||
        Date.now() - deviceStatus.lastStatusUpdate > 15000;

    const loraOffline =
        !deviceStatus.lastLoRaUpdate ||
        Date.now() - deviceStatus.lastLoRaUpdate > 300000; // 5 min

    return {
        wifi: mqttOffline
            ? false
            : deviceStatus.wifi,

        mqtt: mqttOffline
            ? false
            : deviceStatus.mqtt,

        lora: loraOffline
            ? false
            : deviceStatus.lora,

        battery: mqttOffline
            ? null
            : deviceStatus.battery
    };
}
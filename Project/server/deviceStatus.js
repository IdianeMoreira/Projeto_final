let deviceStatus = {
    wifi: false,
    mqtt: false,
    lora: false,
    battery: 0,

    lastStatusUpdate: null,
    lastLoRaUpdate: null
};

export function updateDeviceStatus(newStatus) {

    deviceStatus = {
        ...deviceStatus,
        ...newStatus,
        lastStatusUpdate: Date.now()
    };
}

export function updateLoRaStatus() {

    deviceStatus.lora = true;
    deviceStatus.lastLoRaUpdate = Date.now();
}

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
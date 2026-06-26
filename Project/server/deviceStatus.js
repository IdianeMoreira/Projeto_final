let deviceStatus = {
    wifi: false,
    mqtt: false,
    lora: false,
    battery: 0,
    lastUpdate: null
};

export function updateDeviceStatus(newStatus) {
    deviceStatus = { ...deviceStatus, ...newStatus, lastUpdate: Date.now() };
}

export function getDeviceStatus() {

    const offline =
        !deviceStatus.lastUpdate ||
        Date.now() - deviceStatus.lastUpdate > 15000;

    return {
        wifi: offline ? false : deviceStatus.wifi,
        mqtt: offline ? false : deviceStatus.mqtt,
        lora: offline ? false : deviceStatus.lora,
        battery: offline ? null : deviceStatus.battery
    };
}

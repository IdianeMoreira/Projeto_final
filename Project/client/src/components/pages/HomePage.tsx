import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  peopleInside: number;
  status: any;
  deviceStatus: any;
};

// Ícones 

import wifiIcon from "@/assets/wifi_icon.png";
import mqttIcon from "@/assets/mqtt_icon.png";

function WifiIcon() {
  return <img src={wifiIcon} alt="WiFi" width={90} height={90} />;
}

function MqttIcon() {
  return <img src={mqttIcon} alt="MQTT" width={110} height={110} />;
}

function BatteryIcon({ level }: { level: number }) {
  const color =
    level > 30 ? "rgba(45,125,144,0.9)" :
    level > 15 ? "#eab308" :
    "#dc2626";

  return (
    <svg width="50" height="60" viewBox="0 0 20 30" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Terminal */}
      <rect x="6" y="0" width="8" height="3" rx="1" fill={color} stroke="none" />
      {/* Corpo */}
      <rect x="1" y="3" width="18" height="26" rx="3" />
      {/* Fill */}
      <rect x="3" y={3 + 2 + (20 - Math.round((level / 100) * 20))} width="14" height={Math.round((level / 100) * 20)} rx="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// Componente principal 

function HomePage({ peopleInside, status, deviceStatus}: Props) {
  const isOnline = deviceStatus?.wifi && deviceStatus?.mqtt;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Current Occupancy */}
      <Card className="bg-white border-2 border-[rgba(56,163,165,0.6)]">
        <CardHeader>
          <CardTitle className="text-lg">Current Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{peopleInside}</p>
        </CardContent>
      </Card>

      {/* Last Event */}
      <Card className="bg-white border-2 border-[rgba(56,163,165,0.6)]">
        <CardHeader>
          <CardTitle className="text-lg">Last Event Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {status?.lastMessageSecondsAgo != null
              ? formatElapsedTime(status.lastMessageSecondsAgo)
              : "No data"}
          </p>
        </CardContent>
      </Card>

      {/* Device Status */}
      <Card className="bg-white border-2 border-[rgba(56,163,165,0.6)] md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">M5stickc Plus2 Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 divide-x divide-gray-200 py-4">

            {/* WiFi */}
            <div className="flex flex-col items-center gap-4 px-10">
              <div className="h-16 flex items-center justify-center"><WifiIcon /></div>
              <span className="text-base text-black font-semibold">WiFi</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus?.wifi ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-bold text-lg ${deviceStatus?.wifi ? "text-green-600" : "text-red-600"}`}>
                  {deviceStatus?.wifi ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 px-10">
              <div className="h-16 flex items-center justify-center"><MqttIcon /></div>
              <span className="text-base text-black font-semibold">MQTT</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus?.mqtt ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-bold text-lg ${deviceStatus?.mqtt ? "text-green-600" : "text-red-600"}`}>
                  {deviceStatus?.mqtt ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Battery */}
            <div className="flex flex-col items-center gap-4 px-10">
              {isOnline ? (
                <>
                  <div className="h-16 flex items-center justify-center"><BatteryIcon level={deviceStatus?.battery ?? 0} /></div>
                  <span className="text-base text-black font-semibold">Battery</span>
                  <span className={`font-bold text-lg ${
                    deviceStatus?.battery > 30 ? "text-green-600" :
                    deviceStatus?.battery > 15 ? "text-yellow-500" :
                    "text-red-600"
                  }`}>
                    {deviceStatus?.battery}%
                  </span>
                </>
              ) : (
                <>
                  <div className="h-16 flex items-center justify-center"><BatteryIcon level={0} /></div>
                  <span className="text-base text-black font-semibold">Battery</span>
                  <span className="font-bold text-lg text-gray-400">N/A</span>
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 px-10">
              <div className="h-16 flex items-center justify-center">
                {/* ícone LoRa */}
                <span className="text-6xl">📡</span>
              </div>
              <span className="text-base text-black font-semibold">LoRaWAN</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus?.lora ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-bold text-lg ${deviceStatus?.lora ? "text-green-600" : "text-red-600"}`}>
                  {deviceStatus?.lora ? "Online" : "Offline"}
                </span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function formatElapsedTime(seconds: number) {
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

export default HomePage;
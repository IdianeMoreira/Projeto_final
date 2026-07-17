import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import wifiIcon from "@/assets/wifi_icon.png";
import mqttIcon from "@/assets/mqtt_icon.png";

// Props para o componente HomePage
type Props = {
  peopleInside: number;
  status: any;
  deviceStatus: any;
  loggedUser: string;
  setPage: (page: string) => void;
};

// --- Ícones --------------------------------

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
      <rect x="6" y="0" width="8" height="3" rx="1" fill={color} stroke="none" />
      <rect x="1" y="3" width="18" height="26" rx="3" />
      <rect x="3" y={3 + 2 + (20 - Math.round((level / 100) * 20))} width="14" height={Math.round((level / 100) * 20)} rx="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// --- Componente principal --------------------------------

// Componente HomePage que exibe informações sobre a ocupação atual, último evento registrado e status do dispositivo
function HomePage({ peopleInside, status, deviceStatus, loggedUser, setPage }: Props) {
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

      {/* Card condicionado por login */}
      {loggedUser !== "" ? (

        // ── Autenticado: card do dispositivo ──
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

              {/* MQTT */}
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
                <div className="h-16 flex items-center justify-center">
                  <BatteryIcon level={isOnline ? (deviceStatus?.battery ?? 0) : 0} />
                </div>
                <span className="text-base text-black font-semibold">Battery</span>
                {isOnline ? (
                  <span className={`font-bold text-lg ${
                    deviceStatus?.battery > 30 ? "text-green-600" :
                    deviceStatus?.battery > 15 ? "text-yellow-500" :
                    "text-red-600"
                  }`}>
                    {deviceStatus?.battery}%
                  </span>
                ) : (
                  <span className="font-bold text-lg text-gray-400">N/A</span>
                )}
              </div>

              {/* LoRaWAN */}
              <div className="flex flex-col items-center gap-4 px-10">
                <div className="h-16 flex items-center justify-center">
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

      ) : (

        // ── Não autenticado: card de login ──
        <Card className="bg-white border-2 border-[rgba(56,163,165,0.3)] md:col-span-2">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-10">

            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(45,125,144,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>

            <p className="text-lg font-semibold text-gray-700">
              Conteúdo protegido
            </p>

            <p className="text-sm text-gray-500 text-center max-w-sm">
              Faça login para visualizar o estado do microcontrolador, estatísticas e gráficos de ocupação em tempo real.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                className="px-6 py-2 rounded-md text-white font-medium text-sm"
                style={{ background: "rgba(45,125,144,0.85)" }}
                onClick={() => setPage("login")}
              >
                Entrar
              </button>
              <button
                className="px-6 py-2 rounded-md font-medium text-sm border-2"
                style={{ color: "rgba(45,125,144,0.9)", borderColor: "rgba(45,125,144,0.5)" }}
                onClick={() => setPage("register")}
              >
                Criar conta
              </button>
            </div>

          </CardContent>
        </Card>

      )}

    </div>
  );
}

// Função auxiliar para formatar o tempo decorrido em uma string legível
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
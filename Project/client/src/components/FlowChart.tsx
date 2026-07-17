import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Props para o componente FlowChart
type Props = {
  data: any[];
};

// Componente FlowChart que exibe um gráfico de barras com entradas e saídas por hora
function FlowChart({ data }: Props) {
  const labels = data.map(item => `${item.hour}h`);
  const entries = data.map(item => Number(item.entries));
  const exits = data.map(item => Number(item.exits));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Entries",
        data: entries,
        backgroundColor: "rgba(56,163,165,0.6)",
        borderColor: "#38A3A5",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Exits",
        data: exits,
        backgroundColor: "rgba(45,125,144,0.6)",
        borderColor: "#2D7D90",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${ctx.raw} people`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour of day",
          color: "#6b7280",
          font: { size: 13 },
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Number of people",
          color: "#6b7280",
          font: { size: 13 },
        },
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <div className="h-[450px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default FlowChart;
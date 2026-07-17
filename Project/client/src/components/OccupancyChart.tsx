import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Props para o componente OccupancyChart
type Props = {
  data: any[];
};

// Componente OccupancyChart que exibe um gráfico de linha com a média de ocupação por hora
function OccupancyChart({ data }: Props) {
  const labels = data.map(item => `${item.hour}h`);
  const occupancy = data.map(item => Number(item.average_occupancy));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Average Occupancy",
        data: occupancy,
        borderColor: "rgba(45,125,144,0.8)",
        backgroundColor: "rgba(45,125,144,0.15)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
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
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(1)} people`,
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
        grid: { color: "rgba(0,0,0,0.05)" },
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
    <div className="h-[425px] max-w-5xl mx-auto">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default OccupancyChart;
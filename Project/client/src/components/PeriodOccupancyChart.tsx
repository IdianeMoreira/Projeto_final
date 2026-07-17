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

// Registo dos componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Props para o componente PeriodOccupancyChart
type Props = {
  data: any[];
};

// Componente PeriodOccupancyChart que exibe um gráfico de linha com a média de ocupação por dia
function PeriodOccupancyChart({ data }: Props) {
  const labels = data.map(item => item.day);
  const values = data.map(item => Number(item.average_occupancy));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Average Occupancy",
        data: values,
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
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `Average: ${Number(ctx.raw).toFixed(1)} people`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#6b7280",
          font: { size: 13 },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
        },
      },
      y: {
        title: {
          display: true,
          text: "Average number of people",
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
    <div className="h-[425px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default PeriodOccupancyChart;
import {
  Line
} from "react-chartjs-2";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  data: any[];
};

function OccupancyChart({
  data
}: Props) {

  const labels = data.map(
    item => item.hour
  );

  const occupancy = data.map(
    item => item.average_occupancy
  );

  const chartData = {

    labels,

    datasets: [
      {
        label: "Average Occupancy",
        data: occupancy,
        borderColor: "rgba(45,125,144,0.6)",
        backgroundColor: "rgba(45,125,144,0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: "top" as const
      }

    }

  };

  return (

    <div
      className="
        h-[425px]
        max-w-5xl
        mx-auto
      "
    >

      <Line
        data={chartData}
        options={options}
      />

    </div>

  );

}

export default OccupancyChart;
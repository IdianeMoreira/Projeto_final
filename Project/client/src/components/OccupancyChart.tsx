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
    (item) => item.hour
  );

  const occupancy = data.map(
    (item) => item.average_occupancy
  );

  const chartData = {

    labels,

    datasets: [

      {
        label: "Average Occupancy",

        data: occupancy,

        tension: 0.3,
      },
    ],
  };

  return (

    <Line data={chartData} />

  );
}

export default OccupancyChart;
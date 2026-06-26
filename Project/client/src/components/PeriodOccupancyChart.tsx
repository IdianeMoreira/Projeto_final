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

function PeriodOccupancyChart({
  data
}: Props) {

  const labels = data.map(
    item => item.day
  );

  const values = data.map(
    item => Number(item.average_occupancy)
  );

  const chartData = {

    labels,

    datasets: [

      {

        label: "Average Occupancy",

        data: values,

        borderColor: "rgba(45,125,144,0.6)",

        backgroundColor: "rgba(45,125,144,0.2)",

        tension: 0.3

      }

    ]

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false

  };

  return (

    <div className="h-[425px]">

      <Line
        data={chartData}
        options={options}
      />

    </div>

  );
}

export default PeriodOccupancyChart;
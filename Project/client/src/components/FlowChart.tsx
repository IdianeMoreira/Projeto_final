import {
  Bar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  data: any[];
};

function FlowChart({
  data
}: Props) {

  const labels = data.map(
    (item) => `${item.hour}h`
  );

  const entries = data.map(
    (item) =>
      Number(item.entries)
  );

  const exits = data.map(
    (item) =>
      Number(item.exits)
  );

  const chartData = {

    labels,

    datasets: [

      {
        label: "Entries",

        data: entries,
      },

      {
        label: "Exits",

        data: exits,
      },
    ],
  };

  return (

    <Bar data={chartData} />

  );
}

export default FlowChart;
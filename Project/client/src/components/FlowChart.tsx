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
    (item) => Number(item.entries)
  );

  const exits = data.map(
    (item) => Number(item.exits)
  );

  const chartData = {

    labels,

    datasets: [

      {
        label: "Entries",

        data: entries,

        backgroundColor: "rgba(56,163,165,0.6)",

        borderColor: "#38A3A5",

        borderWidth: 1,
      },

      {
        label: "Exits",

        data: exits,

        backgroundColor: "rgba(45,125,144,0.6)",

        borderColor: "#2D7D90",

        borderWidth: 1,
      },
    ],
  };

  const options = {

    responsive: true,

    maintainAspectRatio: false

  };

  return (

    <div className="h-[450px]">

      <Bar
        data={chartData}
        options={options}
      />

    </div>

  );

}

export default FlowChart;
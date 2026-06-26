import PeriodOccupancyChart from "../PeriodOccupancyChart";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
}
from "@/components/ui/card";

type Props = {
  data: any[];
};

function WeekPage({
  data
}: Props) {

  return (

    <Card>

      <CardHeader>

        <CardTitle>
          Average Occupancy - Last Week
        </CardTitle>

      </CardHeader>

      <CardContent>

        <PeriodOccupancyChart
          data={data}
        />

      </CardContent>

    </Card>

  );
}

export default WeekPage;
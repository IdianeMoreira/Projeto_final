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

function TwoWeeksPage({
  data
}: Props) {

  return (

    <Card>

      <CardHeader>

        <CardTitle>
          Average Occupancy - Last Two Weeks
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

export default TwoWeeksPage;
import FlowChart from "../FlowChart";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
}
from "@/components/ui/card";

type Props = {
  data: any[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  availableDates: string[];
};

function DailyFlowPage({
  data,
  selectedDate,
  setSelectedDate,
  availableDates
}: Props) {

  return (

    <Card>

      <CardHeader>

        <CardTitle>
          Entries vs Exits
        </CardTitle>

      </CardHeader>

      <CardContent>

        <div className="mb-6">

          <select
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(
                e.target.value
              )
            }
            className="
              border
              rounded-md
              p-2
            "
          >

            {
              availableDates.map(
                (date) => (

                  <option
                    key={date}
                    value={date}
                  >

                    {date}

                  </option>

                )
              )
            }

          </select>

        </div>

        <FlowChart
          data={data}
        />

      </CardContent>

    </Card>

  );
}

export default DailyFlowPage;
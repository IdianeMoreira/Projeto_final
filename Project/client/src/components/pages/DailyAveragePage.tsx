import OccupancyChart from "../OccupancyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props para o componente DailyAveragePage
type Props = {
  data: any[];
  selectedDate: string;
  availableDates: string[];
  setSelectedDate: (date: string) => void;
};

// Componente DailyAveragePage que exibe a média diária de ocupação
function DailyAveragePage({ data, selectedDate, availableDates, setSelectedDate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md p-2"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        <OccupancyChart data={data} />
      </CardContent>
    </Card>
  );
}

export default DailyAveragePage;
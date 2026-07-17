import PeriodOccupancyChart from "../PeriodOccupancyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props para o componente WeekPage
type Props = { data: any[] };

// Componente WeekPage que exibe a média de ocupação dos últimos 7 dias
function WeekPage({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Occupancy — Last 7 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <PeriodOccupancyChart data={data} />
      </CardContent>
    </Card>
  );
}

export default WeekPage;
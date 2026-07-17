import PeriodOccupancyChart from "../PeriodOccupancyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props para o componente MonthPage
type Props = { data: any[] };

// Componente MonthPage que exibe a média de ocupação dos últimos 30 dias
function MonthPage({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Occupancy — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <PeriodOccupancyChart data={data} />
      </CardContent>
    </Card>
  );
}

export default MonthPage;
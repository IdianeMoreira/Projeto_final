import PeriodOccupancyChart from "../PeriodOccupancyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props para o componente TwoWeeksPage
type Props = { data: any[] };

// Componente TwoWeeksPage que exibe a média de ocupação dos últimos 14 dias
function TwoWeeksPage({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Occupancy — Last 14 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <PeriodOccupancyChart data={data} />
      </CardContent>
    </Card>
  );
}

export default TwoWeeksPage;
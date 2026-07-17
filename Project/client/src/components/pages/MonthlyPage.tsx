import PeriodOccupancyChart from "../PeriodOccupancyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props para o componente MonthlyPage
type Props = {
  data: any[];
  selectedMonth: string;
  availableMonths: string[];
  setSelectedMonth: (month: string) => void;
};

// Converte "2026-06" para "June 2026"
function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

// Componente MonthlyPage que exibe o gráfico de ocupação mensal
function MonthlyPage({ data, selectedMonth, availableMonths, setSelectedMonth }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly View — Average Occupancy per Day</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md p-2"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
        <PeriodOccupancyChart data={data} />
      </CardContent>
    </Card>
  );
}

export default MonthlyPage;
import { formatCurrency } from "../../lib/utils";
import type { CountryStat } from "@peoplepay/shared";

interface Props {
  data: CountryStat[];
}

export function CountryStats({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold">Salary statistics by country</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Country", "Headcount", "Min", "Avg", "Max", "P50", "P90"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap text-right first:text-left"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.country}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{row.country}</td>
                <td className="px-4 py-3 tabular-nums text-right">
                  {row.headcount.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-nums text-right text-green-700 dark:text-green-400">
                  {formatCurrency(row.min_salary)}
                </td>
                <td className="px-4 py-3 tabular-nums text-right font-medium">
                  {formatCurrency(row.avg_salary)}
                </td>
                <td className="px-4 py-3 tabular-nums text-right text-orange-700 dark:text-orange-400">
                  {formatCurrency(row.max_salary)}
                </td>
                <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                  {formatCurrency(row.p50_salary)}
                </td>
                <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                  {formatCurrency(row.p90_salary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

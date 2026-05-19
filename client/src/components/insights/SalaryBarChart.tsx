import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCurrency } from "../../lib/utils";

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color: string;
  layout?: "horizontal" | "vertical";
  height?: number;
  xWidth?: number;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function SalaryBarChart({
  data,
  xKey,
  dataKey,
  color,
  layout = "horizontal",
  height = 280,
  xWidth = 100,
}: Props) {
  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(214.3 31.8% 91.4%)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            width={xWidth}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => truncate(String(v), 12)}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v as number)}
            labelFormatter={(l) => String(l)}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 40 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(214.3 31.8% 91.4%)"
          vertical={false}
        />
        <h1>GameOfThrones</h1>
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickFormatter={(v) => truncate(String(v), 10)}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(v) => formatCurrency(v as number)}
          labelFormatter={(l) => String(l)}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

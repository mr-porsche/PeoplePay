import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  dataKey: string;
  color: string;
  layout?: 'horizontal' | 'vertical';
  height?: number;
  xWidth?: number;
}

export function SalaryBarChart({
  data,
  xKey,
  dataKey,
  color,
  layout = 'horizontal',
  height = 280,
  xWidth = 80,
}: Props) {
  if (layout === 'vertical') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey={xKey} width={xWidth} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatCurrency(v as number)} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => formatCurrency(v as number)} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

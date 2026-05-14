import { SalaryBarChart } from './SalaryBarChart';
import type { DepartmentStat } from '@peoplepay/shared';

interface Props {
  data: DepartmentStat[];
  selectedCountry: string;
}

export function DepartmentChart({ data, selectedCountry }: Props) {
  if (data.length === 0) return null;

  const chartData = data.slice(0, 10).map((r) => ({
    department: r.department.length > 12 ? r.department.slice(0, 12) + '…' : r.department,
    avg_salary: Math.round(r.avg_salary),
  }));

  return (
    <div className="border border-border rounded-lg p-4 mb-8">
      <h2 className="text-sm font-semibold mb-4">
        Department breakdown{selectedCountry ? ` · ${selectedCountry}` : ''}
      </h2>
      <SalaryBarChart
        data={chartData}
        xKey="department"
        dataKey="avg_salary"
        color="hsl(30 90% 55%)"
        height={220}
      />
    </div>
  );
}

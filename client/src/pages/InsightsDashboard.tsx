import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsApi, employeesApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { StatCard } from '../components/insights/StatCard';
import { SalaryBarChart } from '../components/insights/SalaryBarChart';
import { DepartmentChart } from '../components/insights/DepartmentChart';
import { CountryStats } from '../components/insights/CountryStats';

export function InsightsDashboard() {
  const [selectedCountry, setSelectedCountry] = useState('');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['insights-summary'],
    queryFn: insightsApi.summary,
  });
  const { data: byCountry } = useQuery({
    queryKey: ['insights-country'],
    queryFn: insightsApi.byCountry,
  });
  const { data: byJobCountry } = useQuery({
    queryKey: ['insights-job', selectedCountry],
    queryFn: () => insightsApi.byJobCountry(selectedCountry || undefined),
  });
  const { data: byDept } = useQuery({
    queryKey: ['insights-dept', selectedCountry],
    queryFn: () => insightsApi.byDepartment(selectedCountry || undefined),
  });
  const { data: meta } = useQuery({ queryKey: ['employees-meta'], queryFn: employeesApi.meta });

  const countryChartData = (byCountry ?? []).slice(0, 10).map((r) => ({
    country: r.country,
    avg: Math.round(r.avg_salary),
  }));

  const jobChartData = (byJobCountry ?? []).slice(0, 12).map((r) => ({
    title: r.job_title.replace('Senior ', 'Sr. ').replace('Engineer', 'Eng.'),
    avg: Math.round(r.avg_salary),
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Salary Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics across your organisation</p>
      </div>

      {!summaryLoading && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total employees"
            value={summary.total_employees?.toLocaleString() ?? '0'}
          />
          <StatCard label="Countries" value={summary.total_countries?.toString() ?? '0'} />
          <StatCard label="Departments" value={summary.total_departments?.toString() ?? '0'} />
          <StatCard label="Global avg" value={formatCurrency(summary.global_avg_salary ?? 0)} />
          <StatCard label="Lowest salary" value={formatCurrency(summary.global_min_salary ?? 0)} />
          <StatCard label="Highest salary" value={formatCurrency(summary.global_max_salary ?? 0)} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
        <label className="text-sm font-medium whitespace-nowrap">Filter by country:</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All countries</option>
          {(meta?.countries ?? []).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {selectedCountry && (
          <button
            onClick={() => setSelectedCountry('')}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-4">Average salary by country (top 10)</h2>
          <SalaryBarChart
            data={countryChartData}
            xKey="country"
            dataKey="avg"
            color="hsl(239 84% 67%)"
          />
        </div>

        <div className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-4">
            Average salary by job title
            {selectedCountry ? ` · ${selectedCountry}` : ' (all countries)'}
          </h2>
          <SalaryBarChart
            data={jobChartData}
            xKey="title"
            dataKey="avg"
            color="hsl(150 60% 45%)"
            layout="vertical"
            xWidth={90}
          />
        </div>
      </div>

      <DepartmentChart data={byDept ?? []} selectedCountry={selectedCountry} />

      <CountryStats data={byCountry ?? []} />
    </div>
  );
}

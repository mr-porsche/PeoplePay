import { useQuery } from '@tanstack/react-query';
import { Users, Globe, Building2, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { insightsApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Logo } from '../components/Logo';
import { StatCard } from '../components/insights/StatCard';
import { useNavigate } from 'react-router-dom';

export function OverviewPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useQuery({
    queryKey: ['insights-summary'],
    queryFn: insightsApi.summary,
  });

  if (isLoading || !summary) {
    return (
      <div className="p-8 flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading overview…
      </div>
    );
  }

  const cards = [
    {
      icon: Users,
      label: 'Total employees',
      value: summary.total_employees?.toLocaleString() ?? '0',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: Globe,
      label: 'Countries',
      value: summary.total_countries?.toString() ?? '0',
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
    },
    {
      icon: Building2,
      label: 'Departments',
      value: summary.total_departments?.toString() ?? '0',
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Global avg salary',
      value: formatCurrency(summary.global_avg_salary ?? 0),
      color: 'text-green-600 bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: ArrowDownRight,
      label: 'Lowest salary',
      value: formatCurrency(summary.global_min_salary ?? 0),
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20',
    },
    {
      icon: ArrowUpRight,
      label: 'Highest salary',
      value: formatCurrency(summary.global_max_salary ?? 0),
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-10">
        <Logo size={40} />
        <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed">
          Salary management for your organisation. Manage employees, analyse compensation data, and
          make data-driven pay decisions.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => navigate('/employees')}
          className="text-left border border-border rounded-lg p-5 hover:border-primary/50 hover:bg-muted/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-primary" />
            <span className="font-semibold text-sm">Manage Employees</span>
            <ArrowUpRight
              size={14}
              className="ml-auto text-muted-foreground group-hover:text-primary transition-colors"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add, edit, search, and filter your workforce. Export and manage active or inactive
            staff.
          </p>
        </button>

        <button
          onClick={() => navigate('/insights')}
          className="text-left border border-border rounded-lg p-5 hover:border-primary/50 hover:bg-muted/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-primary" />
            <span className="font-semibold text-sm">Salary Insights</span>
            <ArrowUpRight
              size={14}
              className="ml-auto text-muted-foreground group-hover:text-primary transition-colors"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Explore compensation data by country, department, and job title. View percentile
            breakdowns.
          </p>
        </button>
      </div>

      <div className="text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick start</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Go to <strong className="text-foreground">Employees</strong> to add, edit, or remove
            team members
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Use <strong className="text-foreground">Insights</strong> to explore salary distribution
            by country, job title, and department
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Filter the insights dashboard by country for localised pay analytics
          </li>
        </ul>
      </div>
    </div>
  );
}

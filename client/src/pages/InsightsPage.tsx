import { useQuery } from '@tanstack/react-query';
import { InsightsPanel } from '../components/InsightsPanel';
import { fetchCountryStats, fetchDepartmentStats, fetchTopEarners } from '../api/insights';

export function InsightsPage() {
  const { data: countryStats = [], isLoading: l1 } = useQuery({ queryKey: ['country-stats'], queryFn: fetchCountryStats });
  const { data: departmentStats = [], isLoading: l2 } = useQuery({ queryKey: ['department-stats'], queryFn: fetchDepartmentStats });
  const { data: topEarners = [], isLoading: l3 } = useQuery({ queryKey: ['top-earners'], queryFn: fetchTopEarners });

  if (l1 || l2 || l3) {
    return <div className="text-center py-8 text-(--text)">Loading insights...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-(--text-h)">Salary Insights</h1>
      <InsightsPanel
        countryStats={countryStats}
        departmentStats={departmentStats}
        topEarners={topEarners}
      />
    </div>
  );
}
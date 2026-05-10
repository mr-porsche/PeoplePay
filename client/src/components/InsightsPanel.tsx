import type { CountryStat, DepartmentStat, TopEarner } from "@peoplepay/shared";

interface Props {
  countryStats:    CountryStat[];
  departmentStats: DepartmentStat[];
  topEarners:      TopEarner[];
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function InsightsPanel({ countryStats, departmentStats, topEarners }: Props) {
  if (countryStats.length === 0 && departmentStats.length === 0 && topEarners.length === 0) {
    return (
      <div className="text-center py-8 text-(--text)">
        No insights available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Country Stats */}
      <section>
        <h2 className="text-base font-semibold text-(--text-h) mb-3">Salary by Country</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text)">
                <th className="py-2 px-4 font-medium">Country</th>
                <th className="py-2 px-4 font-medium">Min</th>
                <th className="py-2 px-4 font-medium">Max</th>
                <th className="py-2 px-4 font-medium">Avg</th>
                <th className="py-2 px-4 font-medium">Employees</th>
              </tr>
            </thead>
            <tbody>
              {countryStats.map((s) => (
                <tr key={s.country} className="border-b border-(--border) hover:bg-(--accent-bg) transition-colors">
                  <td className="py-2 px-4 text-(--text-h)">{s.country}</td>
                  <td className="py-2 px-4">{fmt(s.min_salary)}</td>
                  <td className="py-2 px-4">{fmt(s.max_salary)}</td>
                  <td className="py-2 px-4">{fmt(s.avg_salary)}</td>
                  <td className="py-2 px-4">{s.employee_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Department Stats */}
      <section>
        <h2 className="text-base font-semibold text-(--text-h) mb-3">Salary by Department</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text)">
                <th className="py-2 px-4 font-medium">Department</th>
                <th className="py-2 px-4 font-medium">Min</th>
                <th className="py-2 px-4 font-medium">Max</th>
                <th className="py-2 px-4 font-medium">Avg</th>
                <th className="py-2 px-4 font-medium">Employees</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((s) => (
                <tr key={s.department} className="border-b border-(--border) hover:bg-(--accent-bg) transition-colors">
                  <td className="py-2 px-4 text-(--text-h)">{s.department}</td>
                  <td className="py-2 px-4">{fmt(s.min_salary)}</td>
                  <td className="py-2 px-4">{fmt(s.max_salary)}</td>
                  <td className="py-2 px-4">{fmt(s.avg_salary)}</td>
                  <td className="py-2 px-4">{s.employee_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Earners */}
      <section>
        <h2 className="text-base font-semibold text-(--text-h) mb-3">Top Earners</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-(--border) text-left text-(--text)">
                <th className="py-2 px-4 font-medium">Name</th>
                <th className="py-2 px-4 font-medium">Job Title</th>
                <th className="py-2 px-4 font-medium">Department</th>
                <th className="py-2 px-4 font-medium">Country</th>
                <th className="py-2 px-4 font-medium">Salary</th>
              </tr>
            </thead>
            <tbody>
              {topEarners.map((e) => (
                <tr key={e.id} className="border-b border-(--border) hover:bg-(--accent-bg) transition-colors">
                  <td className="py-2 px-4 text-(--text-h)">{e.full_name}</td>
                  <td className="py-2 px-4">{e.job_title}</td>
                  <td className="py-2 px-4">{e.department}</td>
                  <td className="py-2 px-4">{e.country}</td>
                  <td className="py-2 px-4">{fmt(e.salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
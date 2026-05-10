import { useState } from 'react';
import type { EmployeeFilters as Filters } from '@peoplepay/shared';

interface Props {
  onFilterChange: (filters: Omit<Filters, 'page' | 'limit' | 'is_active'>) => void;
}

const empty = { search: '', country: '', department: '', job_title: '' };

export function EmployeeFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState(empty);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange(updated);
  }

  function handleReset() {
    setFilters(empty);
    onFilterChange(empty);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search by name"
        className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent) w-48"
      />
      <input
        name="country"
        value={filters.country}
        onChange={handleChange}
        placeholder="Filter by country"
        className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent) w-48"
      />
      <input
        name="department"
        value={filters.department}
        onChange={handleChange}
        placeholder="Filter by department"
        className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent) w-48"
      />
      <input
        name="job_title"
        value={filters.job_title}
        onChange={handleChange}
        placeholder="Filter by job title"
        className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent) w-48"
      />
      <button
        aria-label="reset"
        onClick={handleReset}
        className="px-3 py-2 text-sm rounded border border-(--border) hover:border-(--accent) hover:text-(--accent) transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
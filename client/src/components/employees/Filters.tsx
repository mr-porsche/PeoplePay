import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { EmployeeFilters } from '@peoplepay/shared';

interface Props {
  meta?: { countries: string[]; departments: string[]; jobTitles: string[] };
  onFilterChange: (filters: Partial<EmployeeFilters>) => void;
}

export function Filters({ meta, onFilterChange }: Props) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('active');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ search: search || undefined, page: 1 });
  }

  function handleReset() {
    setSearch('');
    setCountry('');
    setDepartment('');
    setStatus('active');
    onFilterChange({
      search: undefined,
      country: undefined,
      department: undefined,
      status: 'active',
      page: 1,
    });
  }

  const selectClass =
    'border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="pl-9 pr-3 py-2 border border-border rounded-md text-sm w-56 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2 items-center flex-wrap">
        <Filter size={14} className="text-muted-foreground shrink-0" />

        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            onFilterChange({ country: e.target.value || undefined, page: 1 });
          }}
          className={selectClass}
        >
          <option value="">All countries</option>
          {(meta?.countries ?? []).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            onFilterChange({ department: e.target.value || undefined, page: 1 });
          }}
          className={selectClass}
        >
          <option value="">All departments</option>
          {(meta?.departments ?? []).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            onFilterChange({ status: e.target.value || undefined, page: 1 });
          }}
          className={selectClass}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="">All</option>
        </select>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

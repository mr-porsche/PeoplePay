import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountryStats } from '../CountryStats';
import type { CountryStat } from '@peoplepay/shared';

const mockData: CountryStat[] = [
  {
    country: 'India',
    headcount: 3,
    min_salary: 60000,
    max_salary: 80000,
    avg_salary: 70000,
    p25_salary: 65000,
    p50_salary: 70000,
    p75_salary: 75000,
    p90_salary: 79000,
  },
  {
    country: 'USA',
    headcount: 3,
    min_salary: 110000,
    max_salary: 150000,
    avg_salary: 130000,
    p25_salary: 115000,
    p50_salary: 130000,
    p75_salary: 145000,
    p90_salary: 149000,
  },
];

describe('CountryStats', () => {
  it('should render table headers', () => {
    render(<CountryStats data={mockData} />);
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Headcount')).toBeInTheDocument();
    expect(screen.getByText('P50')).toBeInTheDocument();
    expect(screen.getByText('P90')).toBeInTheDocument();
  });

  it('should render country rows', () => {
    render(<CountryStats data={mockData} />);
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('should render headcount correctly', () => {
    render(<CountryStats data={mockData} />);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should return null when data is empty', () => {
    const { container } = render(<CountryStats data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

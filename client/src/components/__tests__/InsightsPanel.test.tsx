import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightsPanel } from '../InsightsPanel';

const mockCountryStats = [
  { country: 'India', min_salary: 60000, max_salary: 80000, avg_salary: 70000, employee_count: 3 },
  { country: 'USA',   min_salary: 110000, max_salary: 150000, avg_salary: 130000, employee_count: 3 },
];

const mockDepartmentStats = [
  { department: 'Engineering', min_salary: 60000, max_salary: 120000, avg_salary: 90000, employee_count: 3 },
  { department: 'Design',      min_salary: 70000, max_salary: 110000, avg_salary: 90000, employee_count: 2 },
];

const mockTopEarners = [
  { id: 1, full_name: 'Eve',   job_title: 'Manager',  department: 'Management',  country: 'USA',   salary: 150000 },
  { id: 2, full_name: 'Diana', job_title: 'Engineer', department: 'Engineering', country: 'USA',   salary: 120000 },
  { id: 3, full_name: 'Frank', job_title: 'Designer', department: 'Design',      country: 'USA',   salary: 110000 },
];

describe('InsightsPanel', () => {
  it('should render country stats section heading', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText(/salary by country/i).length).toBeGreaterThan(0);
  });

  it('should render each country row', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText('India').length).toBeGreaterThan(0);
    expect(screen.getAllByText('USA').length).toBeGreaterThan(0);
  });

  it('should render department stats section heading', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText(/salary by department/i).length).toBeGreaterThan(0);
  });

  it('should render each department row', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design').length).toBeGreaterThan(0);
  });

  it('should render top earners section heading', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText(/top earners/i).length).toBeGreaterThan(0);
  });

  it('should render each top earner row', () => {
    render(<InsightsPanel countryStats={mockCountryStats} departmentStats={mockDepartmentStats} topEarners={mockTopEarners} />);
    expect(screen.getAllByText('Eve').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Diana').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Frank').length).toBeGreaterThan(0);
  });

  it('should render empty state when no country stats', () => {
    render(<InsightsPanel countryStats={[]} departmentStats={[]} topEarners={[]} />);
    expect(screen.getAllByText(/no insights available/i).length).toBeGreaterThan(0);
  });
});
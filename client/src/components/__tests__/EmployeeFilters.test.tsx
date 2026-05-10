import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeFilters } from '../EmployeeFilters';

describe('EmployeeFilters', () => {
  it('should render search input', () => {
    render(<EmployeeFilters onFilterChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
  });

  it('should render country filter input', () => {
    render(<EmployeeFilters onFilterChange={() => {}} />);
    expect(screen.getByPlaceholderText(/filter by country/i)).toBeInTheDocument();
  });

  it('should render department filter input', () => {
    render(<EmployeeFilters onFilterChange={() => {}} />);
    expect(screen.getByPlaceholderText(/filter by department/i)).toBeInTheDocument();
  });

  it('should render job title filter input', () => {
    render(<EmployeeFilters onFilterChange={() => {}} />);
    expect(screen.getByPlaceholderText(/filter by job title/i)).toBeInTheDocument();
  });

  it('should call onFilterChange when search input changes', () => {
    const onFilterChange = vi.fn();
    render(<EmployeeFilters onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: 'Jane' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'Jane' }));
  });

  it('should call onFilterChange when country changes', () => {
    const onFilterChange = vi.fn();
    render(<EmployeeFilters onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByPlaceholderText(/filter by country/i), { target: { value: 'India' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ country: 'India' }));
  });

  it('should render a reset button and clear filters on click', () => {
    const onFilterChange = vi.fn();
    render(<EmployeeFilters onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onFilterChange).toHaveBeenLastCalledWith({ search: '', country: '', department: '', job_title: '' });
  });
});
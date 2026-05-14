import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeForm } from '../EmployeeForm';
import type { Employee } from '@peoplepay/shared';

const mockEmployee: Employee = {
  id: 1,
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  job_title: 'Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 80000,
  currency: 'USD',
  hire_date: '2023-01-01',
  status: 'active',
  created_at: '',
  updated_at: '',
};

const meta = {
  countries: ['India', 'USA'],
  departments: ['Engineering', 'Design'],
  jobTitles: ['Engineer', 'Designer'],
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

describe('EmployeeForm', () => {
  it('should render all required fields', () => {
    render(<EmployeeForm employee={null} meta={meta} onClose={() => {}} />, { wrapper });
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Engineering')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('India')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('75000')).toBeInTheDocument();
  });

  it('should render Add Employee title when no employee provided', () => {
    render(<EmployeeForm employee={null} meta={meta} onClose={() => {}} />, { wrapper });
    expect(screen.getByText('Add Employee')).toBeInTheDocument();
  });

  it('should render Edit Employee title when employee provided', () => {
    render(<EmployeeForm employee={mockEmployee} meta={meta} onClose={() => {}} />, { wrapper });
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
  });

  it('should pre-fill fields when employee is provided', () => {
    render(<EmployeeForm employee={mockEmployee} meta={meta} onClose={() => {}} />, { wrapper });
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80000')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EmployeeForm employee={null} meta={meta} onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should show validation errors on empty submit', async () => {
    render(<EmployeeForm employee={null} meta={meta} onClose={() => {}} />, { wrapper });
    fireEvent.click(screen.getByText('Add employee'));
    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table } from '../Table';
import type { Employee } from '@peoplepay/shared';

const mockEmployees: Employee[] = [
  {
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
  },
  {
    id: 2,
    full_name: 'Bob Smith',
    email: 'bob@example.com',
    job_title: 'Designer',
    department: 'Design',
    country: 'USA',
    salary: 90000,
    currency: 'USD',
    hire_date: '2023-02-01',
    status: 'active',
    created_at: '',
    updated_at: '',
  },
];

describe('EmployeeTable', () => {
  it('should render table headers', () => {
    render(
      <Table employees={mockEmployees} isLoading={false} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Job Title')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('should render employee rows', () => {
    render(
      <Table employees={mockEmployees} isLoading={false} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('should render empty state when no employees', () => {
    render(<Table employees={[]} isLoading={false} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<Table employees={[]} isLoading={true} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Loading employees…')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <Table employees={mockEmployees} isLoading={false} onEdit={onEdit} onDelete={() => {}} />,
    );
    screen.getAllByTitle('Edit')[0].click();
    expect(onEdit).toHaveBeenCalledWith(mockEmployees[0]);
  });
});

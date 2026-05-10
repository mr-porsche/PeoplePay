import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmployeeTable } from '../EmployeeTable';

const mockEmployees = [
  {
    id: 1,
    full_name: 'Jane Doe',
    job_title: 'Software Engineer',
    department: 'Engineering',
    country: 'India',
    salary: 80000,
    currency: 'USD',
    email: 'jane@example.com',
    phone: null,
    hired_at: '2023-01-01',
    is_active: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
  },
  {
    id: 2,
    full_name: 'Bob Smith',
    job_title: 'Designer',
    department: 'Design',
    country: 'USA',
    salary: 90000,
    currency: 'USD',
    email: 'bob@example.com',
    phone: null,
    hired_at: '2023-02-01',
    is_active: 1,
    created_at: '2023-02-01',
    updated_at: '2023-02-01',
  },
];

describe('EmployeeTable', () => {
  it('should render table headers', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Job Title')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render employee rows', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('should render empty state when no employees', () => {
    render(<EmployeeTable employees={[]} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('No employees found.')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={() => {}} />);
    screen.getAllByRole('button', { name: /edit/i })[0].click();
    expect(onEdit).toHaveBeenCalledWith(mockEmployees[0]);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<EmployeeTable employees={mockEmployees} onEdit={() => {}} onDelete={onDelete} />);
    screen.getAllByRole('button', { name: /delete/i })[0].click();
    expect(onDelete).toHaveBeenCalledWith(mockEmployees[0].id);
  });
});
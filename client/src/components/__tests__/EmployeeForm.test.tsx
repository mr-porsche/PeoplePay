import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeForm } from '../EmployeeForm';

const mockEmployee = {
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
};

describe('EmployeeForm', () => {
  it('should render all required fields', () => {
    render(<EmployeeForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    render(<EmployeeForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should pre-fill fields when employee is provided', () => {
    render(<EmployeeForm employee={mockEmployee} onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/salary/i)).toHaveValue(80000);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<EmployeeForm onSubmit={() => {}} onCancel={onCancel} />);
    screen.getByRole('button', { name: /cancel/i }).click();
    expect(onCancel).toHaveBeenCalled();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText(/full name/i),  { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/job title/i),  { target: { value: 'Manager' } });
    fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'HR' } });
    fireEvent.change(screen.getByLabelText(/country/i),    { target: { value: 'India' } });
    fireEvent.change(screen.getByLabelText(/salary/i),     { target: { value: '95000' } });
    fireEvent.change(screen.getByLabelText(/email/i),      { target: { value: 'alice@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        full_name:  'Alice',
        job_title:  'Manager',
        department: 'HR',
        country:    'India',
        salary:     95000,
        email:      'alice@example.com',
      }));
    });
  });

  it('should show validation error if required fields are empty on submit', async () => {
    render(<EmployeeForm onSubmit={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });
});
import { useState } from 'react';
import type { Employee, CreateEmployeeInput } from '@peoplepay/shared';

interface Props {
  employee?: Employee;
  onSubmit:  (data: CreateEmployeeInput) => void;
  onCancel:  () => void;
}

interface FormErrors {
  full_name?:  string;
  job_title?:  string;
  department?: string;
  country?:    string;
  salary?:     string;
  email?:      string;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    full_name:  employee?.full_name  ?? '',
    job_title:  employee?.job_title  ?? '',
    department: employee?.department ?? '',
    country:    employee?.country    ?? '',
    salary:     employee?.salary     ?? '',
    currency:   employee?.currency   ?? 'USD',
    email:      employee?.email      ?? '',
    phone:      employee?.phone      ?? '',
    hired_at:   employee?.hired_at   ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.full_name.trim())  e.full_name  = 'Full name is required';
    if (!form.job_title.trim())  e.job_title  = 'Job title is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.country.trim())    e.country    = 'Country is required';
    if (!form.email.trim())      e.email      = 'Email is required';
    if (!form.salary || isNaN(Number(form.salary)) || Number(form.salary) <= 0)
                                 e.salary     = 'A valid salary is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      salary:    Number(form.salary),
      is_active: employee ? Boolean(employee.is_active) : true,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm font-medium text-(--text-h)">Full Name</label>
        <input
          id="full_name" name="full_name" value={form.full_name}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.full_name && <span className="text-red-400 text-xs">{errors.full_name}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="job_title" className="text-sm font-medium text-(--text-h)">Job Title</label>
        <input
          id="job_title" name="job_title" value={form.job_title}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.job_title && <span className="text-red-400 text-xs">{errors.job_title}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="department" className="text-sm font-medium text-(--text-h)">Department</label>
        <input
          id="department" name="department" value={form.department}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.department && <span className="text-red-400 text-xs">{errors.department}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="country" className="text-sm font-medium text-(--text-h)">Country</label>
        <input
          id="country" name="country" value={form.country}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.country && <span className="text-red-400 text-xs">{errors.country}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="salary" className="text-sm font-medium text-(--text-h)">Salary</label>
        <input
          id="salary" name="salary" type="number" value={form.salary}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.salary && <span className="text-red-400 text-xs">{errors.salary}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-(--text-h)">Email</label>
        <input
          id="email" name="email" type="email" value={form.email}
          onChange={handleChange}
          className="border border-(--border) rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-(--accent)"
        />
        {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          aria-label="cancel"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded border border-(--border) hover:border-(--accent) transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          aria-label="save"
          className="px-4 py-2 text-sm rounded bg-(--accent) text-white hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>

    </form>
  );
}
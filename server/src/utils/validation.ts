import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters').max(120),
  email: z.string().email('Invalid email address'),
  job_title: z.string().min(2, 'Job title must be at least 2 characters').max(100),
  department: z.string().min(2, 'Department must be at least 2 characters').max(100),
  country: z.string().min(2, 'Country must be at least 2 characters').max(80),
  salary: z.number().positive('Salary must be a positive number'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Hire date must be in YYYY-MM-DD format'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export const EmployeeFiltersSchema = z.object({
  country: z.string().optional(),
  department: z.string().optional(),
  job_title: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  sortBy: z
    .enum([
      'full_name',
      'email',
      'job_title',
      'department',
      'country',
      'salary',
      'hire_date',
      'status',
      'created_at',
    ])
    .default('full_name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeFiltersInput = z.infer<typeof EmployeeFiltersSchema>;

import { z } from 'zod';

export const EmployeeStatusSchema = z.enum([
  'active',
  'inactive',
]);

export const CreateEmployeeSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters'),

  job_title: z
    .string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title cannot exceed 100 characters'),

  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department cannot exceed 100 characters'),

  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country cannot exceed 100 characters'),

  salary: z
    .number()
    .positive('Salary must be greater than 0'),

  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .optional()
    .default('USD'),

  email: z
    .string()
    .email('Invalid email address'),

  phone: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .nullable()
    .optional(),

  hire_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Hire date must be in YYYY-MM-DD format'
    )
    .optional(),

  status: EmployeeStatusSchema
    .optional()
    .default('active'),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export type CreateEmployeeInput = z.input<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.input<typeof UpdateEmployeeSchema>;
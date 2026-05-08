import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  full_name:  z.string().min(2).max(100),
  job_title:  z.string().min(2).max(100),
  department: z.string().min(2).max(100),
  country:    z.string().min(2).max(100),
  salary:     z.number().positive(),
  currency:   z.string().length(3).optional(),
  email:      z.string().email(),
  phone:      z.string().max(20).optional(),
  hired_at:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_active:  z.boolean().optional(),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
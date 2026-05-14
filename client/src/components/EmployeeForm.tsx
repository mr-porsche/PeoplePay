import { zodResolver } from '@hookform/resolvers/zod';
import type { Employee } from '@peoplepay/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { employeesApi } from '../lib/api';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

const schema = z.object({
  full_name: z.string().min(3, 'Required'),
  email: z.string().email('Invalid email'),
  job_title: z.string().min(3, 'Required'),
  department: z.string().min(2, 'Required'),
  country: z.string().min(3, 'Required'),
  salary: z.coerce.number().positive('Must be positive'),
  currency: z.string().length(3).default('USD'),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  employee: Employee | null;
  meta?: { countries: string[]; departments: string[]; jobTitles: string[] };
  onClose: () => void;
}

export function EmployeeForm({ employee, meta, onClose }: Props) {
  const isEdit = Boolean(employee);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee
      ? {
          full_name: employee.full_name,
          email: employee.email,
          job_title: employee.job_title,
          department: employee.department,
          country: employee.country,
          salary: employee.salary,
          currency: employee.currency,
          hire_date: employee.hire_date,
          status: employee.status,
        }
      : {
          salary: 0,
          currency: 'USD',
          status: 'active',
        },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      isEdit ? employeesApi.update(employee!.id, data) : employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
  });

  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring',
      hasError ? 'border-destructive' : 'border-border',
    );

  const field = (label: string, name: keyof FormValues, type: string = 'text') => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} {...register(name)} className={inputClass(!!errors[name])} />
      {errors[name] && (
        <p className="text-xs text-destructive mt-1">{errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg border border-border w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('Full name', 'full_name')}
            {field('Email', 'email', 'email')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job title</label>
              <input
                list="job-titles"
                {...register('job_title')}
                className={inputClass(!!errors.job_title)}
              />
              <datalist id="job-titles">
                {(meta?.jobTitles ?? []).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {errors.job_title && (
                <p className="text-xs text-destructive mt-1">{errors.job_title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                list="departments"
                {...register('department')}
                className={inputClass(!!errors.department)}
              />
              <datalist id="departments">
                {(meta?.departments ?? []).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              {errors.department && (
                <p className="text-xs text-destructive mt-1">{errors.department.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                list="countries"
                {...register('country')}
                className={inputClass(!!errors.country)}
              />
              <datalist id="countries">
                {(meta?.countries ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.country && (
                <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">{field('Salary', 'salary', 'number')}</div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <input
                  {...register('currency')}
                  maxLength={3}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Hire date (YYYY-MM-DD)', 'hire_date')}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className={inputClass(!!errors.status)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Something went wrong'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

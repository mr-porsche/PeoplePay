import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { employeesApi } from "../lib/api";
import { cn } from "../lib/utils";
import type { Employee } from "@peoplepay/shared";
import { SeedUploader } from "./employees/SeedUploader";
import { useState } from "react";

const schema = z.object({
  full_name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  job_title: z.string().min(2, "Required"),
  department: z.string().min(2, "Required"),
  country: z.string().min(2, "Required"),
  salary: z.coerce.number().positive("Must be positive"),
  currency: z.string().length(3).default("USD"),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  status: z.enum(["active", "inactive"]).default("active"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  employee: Employee | null;
  meta?: { countries: string[]; departments: string[]; jobTitles: string[] };
  onClose: () => void;
}

export function EmployeeForm({ employee, meta, onClose }: Props) {
  const [seedOpen, setSeedOpen] = useState(false);
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
      : { currency: "USD", status: "active" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      isEdit
        ? employeesApi.update(employee!.id, data)
        : employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
  });

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full border rounded-md px-3 py-2 text-sm bg-background",
      "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
      "placeholder:text-muted-foreground/50",
      hasError ? "border-destructive" : "border-border hover:border-primary/50",
    );

  const errorMsg = (msg?: string) =>
    msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-lg border border-border w-full max-w-xl max-h-[90vh] overflow-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h2>
          {seedOpen && <SeedUploader onClose={() => setSeedOpen(false)} />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="px-6 py-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Full name
              </label>
              <input
                {...register("full_name")}
                placeholder="Jane Doe"
                className={inputClass(!!errors.full_name)}
              />
              {errorMsg(errors.full_name?.message)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="jane@company.com"
                className={inputClass(!!errors.email)}
              />
              {errorMsg(errors.email?.message)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Job title
              </label>
              <input
                list="job-titles"
                {...register("job_title")}
                placeholder="Software Engineer"
                className={inputClass(!!errors.job_title)}
              />
              <datalist id="job-titles">
                {(meta?.jobTitles ?? []).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {errorMsg(errors.job_title?.message)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Department
              </label>
              <input
                list="departments"
                {...register("department")}
                placeholder="Engineering"
                className={inputClass(!!errors.department)}
              />
              <datalist id="departments">
                {(meta?.departments ?? []).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              {errorMsg(errors.department?.message)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Country
              </label>
              <input
                list="countries"
                {...register("country")}
                placeholder="India"
                className={inputClass(!!errors.country)}
              />
              <datalist id="countries">
                {(meta?.countries ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errorMsg(errors.country?.message)}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">
                  Salary
                </label>
                <input
                  type="number"
                  {...register("salary")}
                  placeholder="75000"
                  className={inputClass(!!errors.salary)}
                />
                {errorMsg(errors.salary?.message)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Currency
                </label>
                <input
                  {...register("currency")}
                  maxLength={3}
                  placeholder="USD"
                  className={cn(inputClass(!!errors.currency), "uppercase")}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Hire date
              </label>
              <input
                type="date"
                {...register("hire_date")}
                className={inputClass(!!errors.hire_date)}
              />
              {errorMsg(errors.hire_date?.message)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                {...register("status")}
                className={cn(inputClass(!!errors.status), "cursor-pointer")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {(mutation.error as Error)?.message ?? "Something went wrong"}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border mt-4">
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
              {mutation.isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Add employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { Employee } from "@peoplepay/shared";

interface Props {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => void;
}

export function Table({ employees, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {[
                "Name",
                "Job Title",
                "Department",
                "Country",
                "Salary",
                "Hire Date",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading employees…</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {emp.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {emp.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {emp.job_title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {emp.department ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {emp.country ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums whitespace-nowrap">
                    {formatCurrency(emp.salary ?? 0, emp.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {emp.hire_date ? formatDate(emp.hire_date) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (emp.status ?? "inactive") === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {emp.status ?? "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${emp.full_name}?`))
                            onDelete(emp.id);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { Employee } from "@peoplepay/shared";

interface Props {
  employees: Employee[];
  onEdit:    (employee: Employee) => void;
  onDelete:  (id: number) => void;
}

export function EmployeeTable({ employees, onEdit, onDelete }: Props) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No employees found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-(--border) text-left text-(--text)">
            <th className="py-3 px-4 font-medium">Full Name</th>
            <th className="py-3 px-4 font-medium">Job Title</th>
            <th className="py-3 px-4 font-medium">Department</th>
            <th className="py-3 px-4 font-medium">Country</th>
            <th className="py-3 px-4 font-medium">Salary</th>
            <th className="py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b border-(--border) hover:bg-(--accent-bg) transition-colors"
            >
              <td className="py-3 px-4 text-(--text-h)">{emp.full_name}</td>
              <td className="py-3 px-4">{emp.job_title}</td>
              <td className="py-3 px-4">{emp.department}</td>
              <td className="py-3 px-4">{emp.country}</td>
              <td className="py-3 px-4">
                {emp.currency} {emp.salary.toLocaleString()}
              </td>
              <td className="py-3 px-4 flex gap-2">
                <button
                  aria-label="edit"
                  onClick={() => onEdit(emp)}
                  className="px-3 py-1 text-xs rounded border border-(--border) hover:border-(--accent) hover:text-r(--accent) transition-colors"
                >
                  Edit
                </button>
                <button
                  aria-label="delete"
                  onClick={() => onDelete(emp.id)}
                  className="px-3 py-1 text-xs rounded border border-(--border) hover:border-red-400 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
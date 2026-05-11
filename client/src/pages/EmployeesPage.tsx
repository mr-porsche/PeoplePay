import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeForm } from '../components/EmployeeForm';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { Pagination } from '../components/Pagination';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import type { Employee, CreateEmployeeInput, EmployeeFilters as Filters } from '@peoplepay/shared';

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<Filters, 'page' | 'limit' | 'is_active'>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditing] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, filters],
    queryFn:  () => fetchEmployees({ ...filters, page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateEmployeeInput }) => updateEmployee(id, input),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  function handleFilterChange(f: Omit<Filters, 'page' | 'limit' | 'is_active'>) {
    setFilters(f);
    setPage(1);
  }

  function handleEdit(emp: Employee) {
    setEditing(emp);
    setShowForm(true);
  }

  function handleSubmit(input: CreateEmployeeInput) {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--text-h)">Employees</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 text-sm rounded bg-(--accent) text-white hover:opacity-90 transition-opacity"
        >
          Add Employee
        </button>
      </div>

      {showForm && (
        <div className="border border-(--border) rounded p-6">
          <h2 className="text-base font-semibold text-(--text-h) mb-4">
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <EmployeeForm
            employee={editingEmployee ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <EmployeeFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="text-center py-8 text-(--text)">Loading...</div>
      ) : (
        <>
          <EmployeeTable
            employees={data?.data ?? []}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
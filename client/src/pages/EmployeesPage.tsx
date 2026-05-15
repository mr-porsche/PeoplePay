import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../lib/api";
import { TableHeader } from "../components/employees/TableHeader";
import { Filters } from "../components/employees/Filters";
import { Table } from "../components/employees/Table";
import { Pagination } from "../components/employees/Pagination";
import { EmployeeForm } from "../components/EmployeeForm";
import type { Employee, EmployeeFilters } from "@peoplepay/shared";
import { SeedUploader } from "../components/employees/SeedUploader";

const PAGE_SIZE = 50;

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
    status: "active",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [seedOpen, setSeedOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => employeesApi.list(filters),
  });

  const { data: meta } = useQuery({
    queryKey: ["employees-meta"],
    queryFn: employeesApi.meta,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  function handleFilterChange(partial: Partial<EmployeeFilters>) {
    setFilters((f) => ({ ...f, ...partial }));
  }

  function handlePageChange(page: number) {
    setFilters((f) => ({ ...f, page }));
  }

  function handleEdit(emp: Employee) {
    setEditEmployee(emp);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditEmployee(null);
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  }

  return (
    <div className="p-6">
      <TableHeader
        total={data?.total}
        onAdd={() => {
          setEditEmployee(null);
          setFormOpen(true);
        }}
        onSeed={() => setSeedOpen(true)}
      />

      <Filters meta={meta} onFilterChange={handleFilterChange} />

      <Table
        employees={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <Pagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={handlePageChange}
      />

      {formOpen && (
        <EmployeeForm
          employee={editEmployee}
          meta={meta}
          onClose={handleFormClose}
        />
      )}

      {seedOpen && <SeedUploader onClose={() => setSeedOpen(false)} />}
    </div>
  );
}

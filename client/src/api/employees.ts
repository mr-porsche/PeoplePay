import type {
    CreateEmployeeInput,
    Employee,
    EmployeeFilters,
    PaginatedEmployees,
    UpdateEmployeeInput
} from '@peoplepay/shared';
import { api } from './client';

export async function fetchEmployees(filters: EmployeeFilters = {}): Promise<PaginatedEmployees> {
  const { data } = await api.get('/api/employees', { params: filters });
  return data;
}

export async function fetchEmployeeById(id: number): Promise<Employee> {
  const { data } = await api.get(`/api/employees/${id}`);
  return data.data;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  console.log('Sending Employee payload:', input);
  const { data } = await api.post('/api/employees', input);
  return data.data;
}

export async function updateEmployee(id: number, input: UpdateEmployeeInput): Promise<Employee> {
  const { data } = await api.patch(`/api/employees/${id}`, input);
  return data.data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/api/employees/${id}`);
}
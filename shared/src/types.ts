export type EmployeeStatus = 'active' | 'inactive';

export interface EmployeeBase {
  full_name:  string;
  email:      string;
  job_title:  string;
  department: string;
  country:    string;
  salary:     number;
  currency:   string;
  phone?:     string | null;
  hire_date:  string;
  status:     EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface Employee extends EmployeeBase {
  id:         number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput
  extends Omit<EmployeeBase, 'currency' | 'hire_date' | 'status'> {
  currency?: string;
  phone?: string;
  hire_date?: string;
  status?: EmployeeStatus;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export interface PaginatedEmployees {
  data:       Employee[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

export interface EmployeeFilters {
  country?:    string;
  department?: string;
  job_title?:  string;
  status?:     EmployeeStatus;
  search?:     string;
  page?:       number;
  pageSize?:   number;
  sortBy?:     string;
  sortOrder?:  'asc' | 'desc';
}

export interface CountrySalaryStats {
  country:    string;
  headcount:  number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  p25_salary: number;
  p50_salary: number;
  p75_salary: number;
  p90_salary: number;
}

export interface JobTitleCountryStat {
  job_title:  string;
  country:    string;
  headcount:  number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface DepartmentStat {
  department: string;
  country:    string;
  headcount:  number;
  avg_salary: number;
}

export interface InsightsSummary {
  total_employees:   number;
  total_countries:   number;
  total_departments: number;
  global_avg_salary: number;
  global_min_salary: number;
  global_max_salary: number;
}

export interface TopEarner {
  id:         number;
  full_name:  string;
  job_title:  string;
  department: string;
  country:    string;
  salary:     number;
}

export interface HeadcountStat {
  country:        string;
  employee_count: number;
}

export interface ApiResponse<T> {
  data:    T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
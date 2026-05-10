export interface Employee {
  id:         number;
  full_name:  string;
  job_title:  string;
  department: string;
  country:    string;
  salary:     number;
  currency:   string;
  email:      string;
  phone:      string | null;
  hired_at:   string;
  is_active:  number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEmployees {
  data:       Employee[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface EmployeeFilters {
  country?:    string;
  job_title?:  string;
  department?: string;
  is_active?:  boolean;
  search?:     string;
  page?:       number;
  limit?:      number;
}

export interface CreateEmployeeInput {
  full_name:  string;
  job_title:  string;
  department: string;
  country:    string;
  salary:     number;
  currency?:  string;
  email:      string;
  phone?:     string;
  hired_at?:  string;
  is_active?: boolean;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export interface CountryStat {
  country:        string;
  min_salary:     number;
  max_salary:     number;
  avg_salary:     number;
  employee_count: number;
}

export interface JobTitleStat {
  job_title:      string;
  avg_salary:     number;
  min_salary:     number;
  max_salary:     number;
  employee_count: number;
}

export interface DepartmentStat {
  department:     string;
  avg_salary:     number;
  min_salary:     number;
  max_salary:     number;
  employee_count: number;
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
  data: T;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { runMigrations } from '../src/db/migrations';
import { closeDb, getDb, resetDb } from '../src/db/database';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from '../src/models/employee.model';

process.env.DB_PATH = ':memory:';

const sample = {
  full_name:  'Jane Doe',
  job_title:  'Software Engineer',
  department: 'Engineering',
  country:    'India',
  salary:     80000,
  currency:   'USD',
  email:      'jane.doe@example.com',
  is_active:  true,
};

describe('Employee Model', () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
  });
  afterAll(()  => closeDb());
  beforeEach(() => getDb().exec('DELETE FROM employees'));

  describe('createEmployee', () => {
    it('should create an employee and return it with an id', () => {
      const emp = createEmployee(sample);
      expect(emp.id).toBeDefined();
      expect(emp.full_name).toBe('Jane Doe');
      expect(emp.email).toBe('jane.doe@example.com');
    });

    it('should default currency to USD', () => {
      const { currency, ...rest } = sample;
      const emp = createEmployee({ ...rest });
      expect(emp.currency).toBe('USD');
    });

    it('should throw on duplicate email', () => {
      createEmployee(sample);
      expect(() => createEmployee({ ...sample, full_name: 'Other' })).toThrow();
    });
  });

  describe('getEmployeeById', () => {
    it('should return the employee by id', () => {
      const created = createEmployee(sample);
      const found   = getEmployeeById(created.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe(sample.email);
    });

    it('should return undefined for non-existent id', () => {
      expect(getEmployeeById(9999)).toBeUndefined();
    });
  });

  describe('getAllEmployees', () => {
    beforeEach(() => {
      createEmployee(sample);
      createEmployee({ ...sample, email: 'b@example.com', full_name: 'Bob', country: 'USA', job_title: 'Designer' });
    });

    it('should return paginated employees', () => {
      const result = getAllEmployees();
      expect(result.total).toBe(2);
      expect(result.data.length).toBe(2);
    });

    it('should filter by country', () => {
      const result = getAllEmployees({ country: 'India' });
      expect(result.total).toBe(1);
      expect(result.data[0].country).toBe('India');
    });

    it('should filter by job_title', () => {
      const result = getAllEmployees({ job_title: 'Designer' });
      expect(result.total).toBe(1);
    });

    it('should search by full_name', () => {
      const result = getAllEmployees({ search: 'Jane' });
      expect(result.total).toBe(1);
      expect(result.data[0].full_name).toBe('Jane Doe');
    });

    it('should paginate correctly', () => {
      const result = getAllEmployees({ page: 1, limit: 1 });
      expect(result.data.length).toBe(1);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('updateEmployee', () => {
    it('should update specified fields only', () => {
      const emp     = createEmployee(sample);
      const updated = updateEmployee(emp.id, { salary: 95000 });
      expect(updated?.salary).toBe(95000);
      expect(updated?.full_name).toBe('Jane Doe');
    });

    it('should return undefined for non-existent id', () => {
      expect(updateEmployee(9999, { salary: 1000 })).toBeUndefined();
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an existing employee and return true', () => {
      const emp = createEmployee(sample);
      expect(deleteEmployee(emp.id)).toBe(true);
      expect(getEmployeeById(emp.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      expect(deleteEmployee(9999)).toBe(false);
    });
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getDb, closeDb, resetDb } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';
import { EmployeeModel } from '../src/models/employee.model';

process.env.DB_PATH = './src/utils/seed/data/test-employee-model.db';

const sample = {
  full_name: 'Jane Doe',
  email: 'jane.doe@example.com',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country: 'India',
  salary: 80000,
  currency: 'USD',
  hire_date: '2023-01-01',
  status: 'active' as const,
};

let model: EmployeeModel;

describe('Employee Model', () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
    model = new EmployeeModel(getDb());
  });

  afterAll(() => closeDb());

  beforeEach(() => getDb().exec('DELETE FROM employees'));

  describe('create', () => {
    it('should create an employee and return it with an id', () => {
      const emp = model.create(sample);
      expect(emp.id).toBeDefined();
      expect(emp.full_name).toBe('Jane Doe');
      expect(emp.email).toBe('jane.doe@example.com');
    });

    it('should default currency to USD', () => {
      const { currency: _currency, ..._rest } = sample;
      const emp = model.create({ ...sample, currency: undefined as any });
      expect(emp.currency).toBe('USD');
    });

    it('should throw on duplicate email', () => {
      model.create(sample);
      expect(() => model.create({ ...sample, full_name: 'Other' })).toThrow();
    });
  });

  describe('findById', () => {
    it('should return the employee by id', () => {
      const created = model.create(sample);
      const found = model.findById(created.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe(sample.email);
    });

    it('should return undefined for non-existent id', () => {
      expect(model.findById(9999)).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return the employee by email', () => {
      model.create(sample);
      const found = model.findByEmail(sample.email);
      expect(found).toBeDefined();
      expect(found?.full_name).toBe('Jane Doe');
    });

    it('should return undefined for non-existent email', () => {
      expect(model.findByEmail('nobody@test.com')).toBeUndefined();
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      model.create(sample);
      model.create({
        ...sample,
        email: 'b@example.com',
        full_name: 'Bob',
        country: 'USA',
        job_title: 'Designer',
      });
    });

    it('should return paginated employees', () => {
      const result = model.findAll();
      expect(result.total).toBe(2);
      expect(result.data.length).toBe(2);
    });

    it('should filter by country', () => {
      const result = model.findAll({ country: 'India' });
      expect(result.total).toBe(1);
      expect(result.data[0].country).toBe('India');
    });

    it('should filter by job_title', () => {
      const result = model.findAll({ job_title: 'Designer' });
      expect(result.total).toBe(1);
    });

    it('should search by full_name, email and job_title', () => {
      const result = model.findAll({ search: 'Jane' });
      expect(result.total).toBe(1);
      expect(result.data[0].full_name).toBe('Jane Doe');
    });

    it('should paginate correctly', () => {
      const result = model.findAll({ page: 1, pageSize: 1 });
      expect(result.data.length).toBe(1);
      expect(result.totalPages).toBe(2);
    });

    it('should sort by salary desc', () => {
      model.create({
        ...sample,
        email: 'c@example.com',
        full_name: 'Charlie',
        salary: 120000,
      });
      const result = model.findAll({
        sortBy: 'salary',
        sortOrder: 'desc',
        status: 'active',
      });
      expect(result.data[0].salary).toBe(120000);
    });
  });

  describe('update', () => {
    it('should update specified fields only', () => {
      const emp = model.create(sample);
      const updated = model.update(emp.id, { salary: 95000 });
      expect(updated?.salary).toBe(95000);
      expect(updated?.full_name).toBe('Jane Doe');
    });

    it('should return undefined for non-existent id', () => {
      expect(model.update(9999, { salary: 1000 })).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete an existing employee and return true', () => {
      const emp = model.create(sample);
      expect(model.delete(emp.id)).toBe(true);
      expect(model.findById(emp.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      expect(model.delete(9999)).toBe(false);
    });
  });

  describe('distinct helpers', () => {
    beforeEach(() => {
      model.create(sample);
      model.create({
        ...sample,
        email: 'b@example.com',
        country: 'USA',
        department: 'Design',
        job_title: 'Designer',
      });
    });

    it('should return distinct countries', () => {
      const countries = model.distinctCountries();
      expect(countries).toContain('India');
      expect(countries).toContain('USA');
    });

    it('should return distinct departments', () => {
      const departments = model.distinctDepartments();
      expect(departments).toContain('Engineering');
      expect(departments).toContain('Design');
    });

    it('should return distinct job titles', () => {
      const titles = model.distinctJobTitles();
      expect(titles).toContain('Software Engineer');
      expect(titles).toContain('Designer');
    });
  });
});

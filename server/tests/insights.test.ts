import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../src/app';
import { runMigrations } from '../src/db/migrations';
import { closeDb, getDb, resetDb } from '../src/db/database';
import { createEmployee } from '../src/models/employee.model';

process.env.DB_PATH = './data/test-insights.db';

const request = supertest(app);

describe('Salary Insights Routes', () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
  });
  afterAll(()  => closeDb());
  beforeEach(() => {
    getDb().exec('DELETE FROM employees');

    // Seed consistent test data
    createEmployee({ full_name: 'Alice',   job_title: 'Engineer',  department: 'Engineering', country: 'India', salary: 60000, email: 'alice@test.com', status: 'active' });
    createEmployee({ full_name: 'Bob',     job_title: 'Engineer',  department: 'Engineering', country: 'India', salary: 80000, email: 'bob@test.com', status: 'active' });
    createEmployee({ full_name: 'Charlie', job_title: 'Designer',  department: 'Design',      country: 'India', salary: 70000, email: 'charlie@test.com', status: 'active' });
    createEmployee({ full_name: 'Diana',   job_title: 'Engineer',  department: 'Engineering', country: 'USA',   salary: 120000, email: 'diana@test.com', status: 'active' });
    createEmployee({ full_name: 'Eve',     job_title: 'Manager',   department: 'Management',  country: 'USA',   salary: 150000, email: 'eve@test.com' });
    createEmployee({ full_name: 'Frank',   job_title: 'Designer',  department: 'Design',      country: 'USA',   salary: 110000, email: 'frank@test.com', status: 'active' });
  });

  // ── Country Stats ──────────────────────────────────────────────
  describe('GET /api/insights/country-stats', () => {
    it('should return min, max, average salary per country', async () => {
      const res = await request.get('/api/insights/country-stats');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);

      const india = res.body.data.find((d: any) => d.country === 'India');
      expect(india).toBeDefined();
      expect(india.min_salary).toBe(60000);
      expect(india.max_salary).toBe(80000);
      expect(india.avg_salary).toBeCloseTo(70000, 0);
      expect(india.employee_count).toBe(3);
    });

    it('should filter by a specific country', async () => {
      const res = await request.get('/api/insights/country-stats?country=USA');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].country).toBe('USA');
      expect(res.body.data[0].min_salary).toBe(110000);
      expect(res.body.data[0].max_salary).toBe(150000);
    });
  });

  // ── Job Title Stats ────────────────────────────────────────────
  describe('GET /api/insights/job-title-stats', () => {
    it('should return average salary by job title in a country', async () => {
      const res = await request.get('/api/insights/job-title-stats?country=India');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);

      const engineer = res.body.data.find((d: any) => d.job_title === 'Engineer');
      expect(engineer).toBeDefined();
      expect(engineer.avg_salary).toBeCloseTo(70000, 0);
      expect(engineer.employee_count).toBe(2);
    });

    it('should return 400 if country is not provided', async () => {
      const res = await request.get('/api/insights/job-title-stats');
      expect(res.status).toBe(400);
    });
  });

  // ── Department Stats ───────────────────────────────────────────
  describe('GET /api/insights/department-stats', () => {
    it('should return salary stats grouped by department', async () => {
      const res = await request.get('/api/insights/department-stats');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);

      const eng = res.body.data.find((d: any) => d.department === 'Engineering');
      expect(eng).toBeDefined();
      expect(eng.avg_salary).toBeDefined();
      expect(eng.employee_count).toBe(3);
    });
  });

  // ── Top Earners ────────────────────────────────────────────────
  describe('GET /api/insights/top-earners', () => {
    it('should return top 5 highest paid employees by default', async () => {
      const res = await request.get('/api/insights/top-earners');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.data[0].salary).toBeGreaterThanOrEqual(res.body.data[1].salary);
    });

    it('should respect a custom limit', async () => {
      const res = await request.get('/api/insights/top-earners?limit=3');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
    });
  });

  // ── Headcount ─────────────────────────────────────────────────
  describe('GET /api/insights/headcount', () => {
    it('should return employee headcount by country', async () => {
      const res = await request.get('/api/insights/headcount');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);

      const india = res.body.data.find((d: any) => d.country === 'India');
      expect(india.employee_count).toBe(3);
    });
  });
});
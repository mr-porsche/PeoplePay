import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../src/app';
import { runMigrations } from '../src/db/migrations';
import { closeDb, getDb, resetDb } from '../src/db/database';

process.env.DB_PATH = './data/test-employee-routes.db';

const request = supertest(app);

const sample = {
  full_name:  'Jane Doe',
  job_title:  'Software Engineer',
  department: 'Engineering',
  country:    'India',
  salary:     80000,
  currency:   'USD',
  email:      'jane.doe@example.com',
};

describe('Employee Routes', () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
  });
  afterAll(()  => closeDb());
  beforeEach(() => getDb().exec('DELETE FROM employees'));

  describe('POST /api/employees', () => {
    it('should create an employee and return 201', async () => {
      const res = await request.post('/api/employees').send(sample);
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(sample.email);
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request.post('/api/employees').send({ full_name: 'No Email' });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      await request.post('/api/employees').send(sample);
      const res = await request.post('/api/employees').send(sample);
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/employees', () => {
    beforeEach(async () => {
      await request.post('/api/employees').send(sample);
      await request.post('/api/employees').send({ ...sample, email: 'bob@example.com', full_name: 'Bob Smith', country: 'USA' });
    });

    it('should return paginated list of employees', async () => {
      const res = await request.get('/api/employees');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(2);
    });

    it('should filter by country', async () => {
      const res = await request.get('/api/employees?country=India');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].country).toBe('India');
    });

    it('should search by name', async () => {
      const res = await request.get('/api/employees?search=Jane');
      expect(res.status).toBe(200);
      expect(res.body.data[0].full_name).toBe('Jane Doe');
    });

    it('should paginate results', async () => {
      const res = await request.get('/api/employees?page=1&limit=1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return an employee by id', async () => {
      const created = await request.post('/api/employees').send(sample);
      const res     = await request.get(`/api/employees/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(sample.email);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request.get('/api/employees/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/employees/:id', () => {
    it('should update an employee and return updated data', async () => {
      const created = await request.post('/api/employees').send(sample);
      const res     = await request.patch(`/api/employees/${created.body.data.id}`).send({ salary: 95000 });
      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe(95000);
      expect(res.body.data.full_name).toBe('Jane Doe');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request.patch('/api/employees/9999').send({ salary: 1000 });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid fields', async () => {
      const created = await request.post('/api/employees').send(sample);
      const res     = await request.patch(`/api/employees/${created.body.data.id}`).send({ salary: -500 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should delete an employee and return 200', async () => {
      const created = await request.post('/api/employees').send(sample);
      const res     = await request.delete(`/api/employees/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request.delete('/api/employees/9999');
      expect(res.status).toBe(404);
    });
  });
});
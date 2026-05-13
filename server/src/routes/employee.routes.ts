import { Router, type Request, type Response } from 'express';
import { EmployeeModel } from '../models/employee.model';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmployeeFiltersSchema,
} from '../utils/validation';

export function employeeRouter(model: EmployeeModel): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const parsed = EmployeeFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    res.json(model.findAll(parsed.data));
  });

  router.get('/meta', (_req: Request, res: Response) => {
    res.json({
      countries: model.distinctCountries(),
      departments: model.distinctDepartments(),
      jobTitles: model.distinctJobTitles(),
    });
  });

  router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const employee = model.findById(id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ data: employee });
  });

  router.post('/', (req: Request, res: Response) => {
    const parsed = CreateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const existing = model.findByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const employee = model.create(parsed.data);
    res.status(201).json({ data: employee });
  });

  router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const parsed = UpdateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const employee = model.update(id, parsed.data);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ data: employee });
  });

  router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const deleted = model.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}

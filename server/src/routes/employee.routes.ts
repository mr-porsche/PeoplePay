import { Router, Request, Response } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../models/employee.model';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
} from '../validators/employee.validator';

const router = Router();

// GET /api/employees
router.get('/', (req: Request, res: Response) => {
  const {
    country,
    job_title,
    department,
    search,
    page,
    limit,
    is_active,
  } = req.query;

  const result = getAllEmployees({
    country:    country    as string | undefined,
    job_title:  job_title  as string | undefined,
    department: department as string | undefined,
    search:     search     as string | undefined,
    is_active:  is_active !== undefined ? is_active === 'true' : undefined,
    page:       page  ? parseInt(page  as string) : undefined,
    limit:      limit ? parseInt(limit as string) : undefined,
  });

  res.json(result);
});

// GET /api/employees/:id
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const employee = getEmployeeById(parseInt(req.params.id));
  if (!employee) {
    res.status(404).json({ message: 'Employee not found' });
    return;
  }
  res.json({ data: employee });
});

// POST /api/employees
router.post('/', (req: Request, res: Response) => {
  const parsed = CreateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const employee = createEmployee(parsed.data);
    res.status(201).json({ data: employee });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('UNIQUE')) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/employees/:id
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  const parsed = UpdateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const updated = updateEmployee(parseInt(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ message: 'Employee not found' });
    return;
  }

  res.json({ data: updated });
});

// DELETE /api/employees/:id
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const deleted = deleteEmployee(parseInt(req.params.id));
  if (!deleted) {
    res.status(404).json({ message: 'Employee not found' });
    return;
  }
  res.json({ message: 'Employee deleted successfully' });
});

export default router;
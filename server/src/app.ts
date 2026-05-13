import express from 'express';
import cors from 'cors';
import { getDb } from './db/database';
import { EmployeeModel } from './models/employee.model';
import { InsightsModel } from './models/insights.model';
import { employeeRouter } from './routes/employee.routes';
import { insightsRouter } from './routes/insights.routes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const db = getDb();
const employeeModel = new EmployeeModel(db);
const insightsModel = new InsightsModel(db);

app.use('/api/employees', employeeRouter(employeeModel));
app.use('/api/insights', insightsRouter(insightsModel));

export default app;

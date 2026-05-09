import express from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employee.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/employees', employeeRoutes);

export default app;
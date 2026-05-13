import { Router, type Request, type Response } from 'express';
import { InsightsModel } from '../models/insights.model';

export function insightsRouter(model: InsightsModel): Router {
  const router = Router();

  router.get('/summary', (_req: Request, res: Response) => {
    res.json(model.getSummary());
  });

  router.get('/by-country', (_req: Request, res: Response) => {
    res.json(model.getByCountry());
  });

  router.get('/by-job-country', (req: Request, res: Response) => {
    const countryQuery = req.query.country;
    const country = Array.isArray(countryQuery) ? countryQuery[0] : countryQuery;
    res.json(model.getByJobAndCountry(country as string | undefined));
  });

  router.get('/by-department', (req: Request, res: Response) => {
    const countryQuery = req.query.country;
    const country = Array.isArray(countryQuery) ? countryQuery[0] : countryQuery;
    res.json(model.getByDepartment(country as string | undefined));
  });

  return router;
}

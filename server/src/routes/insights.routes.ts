import { Router, Request, Response } from 'express';
import {
  getCountryStats,
  getDepartmentStats,
  getHeadcountByCountry,
  getJobTitleStats,
  getTopEarners,
} from '../models/insights.model';

const router = Router();

// GET /api/insights/country-stats
router.get('/country-stats', (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;
  const data    = getCountryStats(country);
  res.json({ data });
});

// GET /api/insights/job-title-stats?country=India
router.get('/job-title-stats', (req: Request, res: Response) => {
  const country = req.query.country as string | undefined;
  if (!country) {
    res.status(400).json({ message: 'country query parameter is required' });
    return;
  }
  const data = getJobTitleStats(country);
  res.json({ data });
});

// GET /api/insights/department-stats
router.get('/department-stats', (_req: Request, res: Response) => {
  const data = getDepartmentStats();
  res.json({ data });
});

// GET /api/insights/top-earners?limit=5
router.get('/top-earners', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
  const data  = getTopEarners(limit);
  res.json({ data });
});

// GET /api/insights/headcount
router.get('/headcount', (_req: Request, res: Response) => {
  const data = getHeadcountByCountry();
  res.json({ data });
});

export default router;
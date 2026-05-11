import type {
    CountryStat,
    DepartmentStat,
    HeadcountStat,
    JobTitleStat,
    TopEarner
} from '@peoplepay/shared';
import { api } from './client';

export async function fetchCountryStats(country?: string): Promise<CountryStat[]> {
  const { data } = await api.get('/api/insights/country-stats', { params: { country } });
  return data.data;
}

export async function fetchJobTitleStats(country: string): Promise<JobTitleStat[]> {
  const { data } = await api.get('/api/insights/job-title-stats', { params: { country } });
  return data.data;
}

export async function fetchDepartmentStats(): Promise<DepartmentStat[]> {
  const { data } = await api.get('/api/insights/department-stats');
  return data.data;
}

export async function fetchTopEarners(limit = 5): Promise<TopEarner[]> {
  const { data } = await api.get('/api/insights/top-earners', { params: { limit } });
  return data.data;
}

export async function fetchHeadcount(): Promise<HeadcountStat[]> {
  const { data } = await api.get('/api/insights/headcount');
  return data.data;
}
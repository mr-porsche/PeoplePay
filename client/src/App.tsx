import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeesPage } from './pages/EmployeesPage';
import { InsightsPage } from './pages/InsightsPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <nav className="border-b border-(--border) px-6 py-4 flex items-center gap-8">
            <span className="font-semibold text-(--text-h) text-lg tracking-tight">PeoplePay</span>
            <div className="flex gap-6">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) hover:text-(--text-h)'}`
                }
              >
                Employees
              </NavLink>
              <NavLink
                to="/insights"
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) hover:text-(--text-h)'}`
                }
              >
                Insights
              </NavLink>
            </div>
          </nav>

          <main className="flex-1">
            <Routes>
              <Route path="/"         element={<EmployeesPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
import { NavLink, Outlet } from 'react-router-dom';
import { Users, BarChart3, Home, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { to: '/', icon: Home, label: 'Overview', end: true },
  { to: '/employees', icon: Users, label: 'Employees', end: false },
  { to: '/insights', icon: BarChart3, label: 'Insights', end: false },
];

export function AppLayout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-60 border-r border-border flex flex-col py-6 px-4 shrink-0">
        <div className="mb-8 px-2">
          <Logo size={28} />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">HR Admin Portal</p>
              <p className="text-xs text-muted-foreground">PeoplePay v1.0</p>
            </div>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

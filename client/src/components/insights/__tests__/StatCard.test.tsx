import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="Total employees" value="1,234" />);
    expect(screen.getByText('Total employees')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<StatCard label="Total" value="100" icon={Users} color="text-blue-600 bg-blue-50" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should render note when provided', () => {
    render(<StatCard label="Avg salary" value="75,000" note="Raw values" />);
    expect(screen.getByText('Raw values')).toBeInTheDocument();
  });
});

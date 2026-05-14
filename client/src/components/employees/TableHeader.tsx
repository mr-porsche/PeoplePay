import { Plus } from 'lucide-react';

interface Props {
  total: number | undefined;
  onAdd: () => void;
}

export function TableHeader({ total, onAdd }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total != null ? `${total.toLocaleString()} employees` : 'Loading…'}
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus size={16} />
        Add Employee
      </button>
    </div>
  );
}

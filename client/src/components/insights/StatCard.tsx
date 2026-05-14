import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  color?: string;
  note?: string;
}

export function StatCard({ label, value, icon: Icon, color, note }: Props) {
  return (
    <div className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
      {Icon && color && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
          <Icon size={18} />
        </div>
      )}
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
        {label}
      </p>
      {note && <p className="text-xs text-muted-foreground/60 mt-1">{note}</p>}
    </div>
  );
}

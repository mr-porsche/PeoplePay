import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  color?: string;
  note?: string;
}

export function StatCard({ label, value, icon: Icon, color, note }: Props) {
  return (
    <div className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow flex flex-col gap-2 min-w-0">
      {Icon && color && (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}
        >
          <Icon size={16} />
        </div>
      )}
      <p className="text-xl font-semibold tabular-nums tracking-tight break-all leading-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-tight">
        {label}
      </p>
      {note && <p className="text-xs text-muted-foreground/60">{note}</p>}
    </div>
  );
}

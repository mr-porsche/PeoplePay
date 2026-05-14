interface LogoProps {
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 32, showWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Circle background */}
        <rect width="32" height="32" rx="8" fill="hsl(239 84% 67%)" />
        {/* People silhouette */}
        <circle cx="12" cy="11" r="3" fill="white" fillOpacity="0.9" />
        <path
          d="M6 22c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          fillOpacity="0.9"
        />
        {/* Pay symbol — $ overlapping right */}
        <circle cx="21" cy="14" r="6" fill="white" fillOpacity="0.15" />
        <text
          x="21"
          y="18"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="white"
          fontFamily="system-ui, sans-serif"
        >
          $
        </text>
      </svg>

      {showWordmark && (
        <span className="font-semibold text-xl tracking-tight">
          <span className="text-primary">People</span>
          <span className="text-foreground">Pay</span>
        </span>
      )}
    </div>
  );
}

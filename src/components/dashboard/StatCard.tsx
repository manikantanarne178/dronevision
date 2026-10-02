import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: "cyan" | "emerald" | "amber" | "indigo" | "rose";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = "cyan",
}: Props) {
  const colorStyles = {
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const strVal = String(value);

  // Dynamic font sizing to prevent overflow and text truncation
  const getValueSizeClass = () => {
    if (strVal.length <= 4) return "text-xl sm:text-2xl font-black";
    if (strVal.length <= 8) return "text-lg sm:text-xl font-bold";
    if (strVal.length <= 16) return "text-base sm:text-lg font-bold";
    return "text-xs sm:text-sm font-bold leading-tight";
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between min-w-0">
      <div>
        {/* Top Header: Title and Icon Badge clearly separated */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p
            className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate flex-1 min-w-0"
            title={title}
          >
            {title}
          </p>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorStyles[color]}`}
          >
            <Icon size={16} />
          </div>
        </div>

        {/* Value: Sits neatly below header with zero overlapping */}
        <div className="mt-0.5">
          <span
            className={`${getValueSizeClass()} text-slate-900 tracking-tight block truncate`}
            title={strVal}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Footer Subtitle / Trend */}
      {(subtitle || trend) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] leading-none gap-1">
          {subtitle && (
            <span className="text-slate-400 truncate flex-1 min-w-0" title={subtitle}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold shrink-0 ${
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
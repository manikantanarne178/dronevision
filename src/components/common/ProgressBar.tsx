import React from "react";

interface Props {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: "cyan" | "emerald" | "amber" | "rose" | "indigo";
  animated?: boolean;
  height?: string;
}

export const ProgressBar: React.FC<Props> = ({
  progress,
  label,
  showPercentage = true,
  color = "cyan",
  animated = true,
  height = "h-2",
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorMap = {
    cyan: "bg-cyan-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-600",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600">
          <span className="truncate pr-2">{label}</span>
          {showPercentage && (
            <span className="font-mono text-slate-800">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 ${height}`}
      >
        <div
          className={`${height} ${colorMap[color]} transition-all duration-500 ease-out rounded-full ${
            animated && clampedProgress < 100 && clampedProgress > 0
              ? "animate-pulse"
              : ""
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

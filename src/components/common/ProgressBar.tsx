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
  height = "h-2.5",
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorMap = {
    cyan: "bg-cyan-500 shadow-cyan-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    rose: "bg-rose-500 shadow-rose-500/20",
    indigo: "bg-indigo-500 shadow-indigo-500/20",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-300">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 ${height}`}>
        <div
          className={`${height} ${colorMap[color]} transition-all duration-500 ease-out rounded-full ${
            animated && clampedProgress < 100 ? "animate-pulse" : ""
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

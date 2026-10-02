import React from "react";

interface Props {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const ScoreCard: React.FC<Props> = ({ score, title, subtitle, icon }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85)
      return {
        text: "text-emerald-600",
        border: "border-emerald-200",
        bg: "bg-emerald-50/50",
        stroke: "#059669",
        track: "#E2E8F0",
      };
    if (val >= 60)
      return {
        text: "text-amber-600",
        border: "border-amber-200",
        bg: "bg-amber-50/50",
        stroke: "#D97706",
        track: "#E2E8F0",
      };
    return {
      text: "text-rose-600",
      border: "border-rose-200",
      bg: "bg-rose-50/50",
      stroke: "#DC2626",
      track: "#E2E8F0",
    };
  };

  const style = getScoreColor(score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${style.border} flex items-center gap-4 shadow-sm`}
    >
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={style.track}
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={style.stroke}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-lg font-black ${style.text}`}>{score}%</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {icon && <span className={style.text}>{icon}</span>}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
            {title}
          </h3>
        </div>
        {subtitle && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScoreCard;

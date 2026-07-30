import React from "react";

interface Props {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const ScoreCard: React.FC<Props> = ({ score, title, subtitle, icon }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return { text: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10", stroke: "#10b981" };
    if (val >= 60) return { text: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/10", stroke: "#f59e0b" };
    return { text: "text-rose-400", border: "border-rose-500/40", bg: "bg-rose-500/10", stroke: "#ef4444" };
  };

  const style = getScoreColor(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-2xl border p-5 bg-slate-900/80 backdrop-blur-sm ${style.border} flex items-center gap-5 shadow-lg`}>
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={style.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${style.text}`}>{score}%</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className={style.text}>{icon}</span>}
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        {subtitle && <p className="text-slate-400 text-xs leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ScoreCard;

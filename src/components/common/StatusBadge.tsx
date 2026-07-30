import React from "react";

interface Props {
  status: "PASS" | "FAIL" | "WARNING" | "APPROVED" | "REJECTED" | "PENDING" | "IN_REVIEW" | "DRAFT" | "PARSED" | "VALIDATED" | string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<Props> = ({ status, label, size = "md" }) => {
  const normalized = (status || "").toUpperCase();
  const text = label || status;

  let bg = "bg-slate-800 text-slate-300 border-slate-700";

  if (["PASS", "APPROVED", "VALIDATED", "HEALTHY"].includes(normalized)) {
    bg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  } else if (["FAIL", "REJECTED"].includes(normalized)) {
    bg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  } else if (["WARNING", "CONDITIONAL", "IN_REVIEW"].includes(normalized)) {
    bg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  } else if (["PENDING", "PARSED", "DRAFT"].includes(normalized)) {
    bg = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-md border",
    md: "px-3 py-1 text-xs font-semibold rounded-full border",
    lg: "px-4 py-1.5 text-sm font-bold rounded-full border",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {text}
    </span>
  );
};

export default StatusBadge;

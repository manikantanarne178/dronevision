import React from "react";

interface Props {
  status:
    | "PASS"
    | "FAIL"
    | "WARNING"
    | "APPROVED"
    | "REJECTED"
    | "PENDING"
    | "IN_REVIEW"
    | "DRAFT"
    | "PARSED"
    | "VALIDATED"
    | "DETECTED"
    | "CALCULATED"
    | "CERTIFIED"
    | "COMPLIANT"
    | "NON_COMPLIANT"
    | "HEALTHY"
    | "ACTIVE"
    | "AUDITED"
    | string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<Props> = ({ status, label, size = "md" }) => {
  const normalized = (status || "").toUpperCase();
  const text = label || status;

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  if (
    [
      "PASS",
      "APPROVED",
      "VALIDATED",
      "HEALTHY",
      "COMPLETED",
      "CERTIFIED",
      "COMPLIANT",
      "ACTIVE",
      "DETECTED",
      "CALCULATED",
    ].includes(normalized)
  ) {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  } else if (["FAIL", "REJECTED", "NON_COMPLIANT", "ERROR"].includes(normalized)) {
    styles = "bg-rose-50 text-rose-700 border-rose-200/80";
  } else if (
    ["WARNING", "CONDITIONAL", "IN_REVIEW"].includes(normalized)
  ) {
    styles = "bg-amber-50 text-amber-700 border-amber-200/80";
  } else if (
    ["PENDING", "PARSED", "DRAFT", "AUDITED", "PROCESSING"].includes(normalized)
  ) {
    styles = "bg-cyan-50 text-cyan-700 border-cyan-200/80";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-semibold rounded-md border",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg border",
    lg: "px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl border",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {text}
    </span>
  );
};

export default StatusBadge;

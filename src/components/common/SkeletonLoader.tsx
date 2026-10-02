import React from "react";

interface Props {
  type?: "card" | "table" | "chart" | "text";
  count?: number;
}

export const SkeletonLoader: React.FC<Props> = ({
  type = "card",
  count = 3,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        {items.map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-1/3" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-7 bg-slate-200 rounded w-2/3" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-4 my-4">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-4 my-4">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-100 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-pulse my-4">
      {items.map((i) => (
        <div key={i} className="h-4 bg-slate-200 rounded w-full" />
      ))}
    </div>
  );
};

export default SkeletonLoader;

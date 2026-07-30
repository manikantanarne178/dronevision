import React from "react";

interface Props {
  type?: "card" | "table" | "chart" | "text";
  count?: number;
}

export const SkeletonLoader: React.FC<Props> = ({ type = "card", count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === "table") {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-slate-800/80 rounded-xl" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-900/60 rounded-xl border border-slate-800/60 flex items-center px-4 gap-4">
            <div className="h-4 w-1/4 bg-slate-800 rounded" />
            <div className="h-4 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-1/6 bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-800 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="w-full h-72 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 animate-pulse flex flex-col justify-between">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="flex items-end gap-3 h-48 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-800 rounded-t-lg"
              style={{ height: `${Math.floor(Math.random() * 60) + 30}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-slate-800 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((_, i) => (
        <div key={i} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="w-10 h-10 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-8 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-40 bg-slate-800/60 rounded" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

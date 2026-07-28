import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: Props) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-400">

            {title}

          </p>

          <h2 className="text-3xl font-bold mt-2">

            {value}

          </h2>

        </div>

        <div className="bg-cyan-500/20 p-4 rounded-xl">

          <Icon className="text-cyan-400" />

        </div>

      </div>

    </div>
  );
}
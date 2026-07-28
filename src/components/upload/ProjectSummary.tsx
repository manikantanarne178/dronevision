import {
  Image,
  HardDrive,
  Clock3,
  CheckCircle2,
  Drone,
  Map,
} from "lucide-react";

interface Props {
  files: File[];
}

export default function ProjectSummary({ files }: Props) {
  const totalSize = (
    files.reduce((sum, file) => sum + file.size, 0) /
    1024 /
    1024
  ).toFixed(2);

  const estimatedTime = Math.max(1, Math.ceil(files.length / 20));

  return (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Project Summary
        </h2>

        <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm">
          Ready for Processing
        </span>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">

        <SummaryCard
          icon={<Image size={22} />}
          title="Images"
          value={files.length.toString()}
        />

        <SummaryCard
          icon={<HardDrive size={22} />}
          title="Storage"
          value={`${totalSize} MB`}
        />

        <SummaryCard
          icon={<Clock3 size={22} />}
          title="Estimated Time"
          value={`${estimatedTime} min`}
        />

        <SummaryCard
          icon={<Drone size={22} />}
          title="Drone"
          value="DJI Mavic 3"
        />

        <SummaryCard
          icon={<Map size={22} />}
          title="Mission"
          value="Survey Mapping"
        />

        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          title="Status"
          value="Ready"
        />

      </div>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function SummaryCard({ icon, title, value }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

      <div className="flex items-center gap-3 text-cyan-400">

        {icon}

        <span className="text-sm text-slate-400">
          {title}
        </span>

      </div>

      <h3 className="text-2xl font-bold mt-4">
        {value}
      </h3>

    </div>
  );
}
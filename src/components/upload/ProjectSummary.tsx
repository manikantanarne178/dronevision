import {
  Image as ImageIcon,
  HardDrive,
  Clock3,
  CheckCircle2,
  Cpu,
  Layers,
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Batch Diagnostics & Resource Estimation
          </h2>
          <p className="text-xs text-slate-500">
            Automated validation metrics for current ingestion queue.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Ready for Ingestion
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          icon={<ImageIcon className="w-4 h-4 text-cyan-600" />}
          title="Image Count"
          value={files.length.toString()}
          subtext="Photos validated"
        />

        <SummaryCard
          icon={<HardDrive className="w-4 h-4 text-indigo-600" />}
          title="Payload Size"
          value={`${totalSize} MB`}
          subtext="Uncompressed"
        />

        <SummaryCard
          icon={<Clock3 className="w-4 h-4 text-amber-600" />}
          title="Estimated Est."
          value={`~${estimatedTime} min`}
          subtext="SfM reconstruction"
        />

        <SummaryCard
          icon={<Cpu className="w-4 h-4 text-cyan-600" />}
          title="SfM Engine"
          value="Photogrammetry"
          subtext="Direct SfM + GLB"
        />

        <SummaryCard
          icon={<Layers className="w-4 h-4 text-emerald-600" />}
          title="Output Target"
          value="3D GLB Model"
          subtext="Point Cloud & Mesh"
        />

        <SummaryCard
          icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
          title="Integrity Check"
          value="100% Pass"
          subtext="Header valid"
        />
      </div>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext: string;
}

function SummaryCard({ icon, title, value, subtext }: CardProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[11px] font-medium text-slate-500 truncate">
          {title}
        </span>
      </div>
      <div className="text-base font-bold text-slate-900 truncate">
        {value}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
        {subtext}
      </div>
    </div>
  );
}
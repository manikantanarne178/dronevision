import { Link } from "react-router-dom";
import { Box, Calendar, ChevronRight, Image as ImageIcon, Ruler } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/date";

interface Project {
  project_id: string;
  generated_at?: string;
  images_uploaded?: number;
  width?: number;
  length?: number;
  height?: number;
}

interface Props {
  projects: Project[];
}

export default function RecentProjects({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs">
        No recent drone survey reconstructions found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {projects.slice(0, 5).map((project) => (
        <Link
          key={project.project_id}
          to={`/viewer/${project.project_id}`}
          className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
              <Box size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-cyan-700 transition-colors">
                {project.project_id}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                {project.generated_at && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(project.generated_at)}
                  </span>
                )}
                {project.images_uploaded !== undefined && (
                  <span className="flex items-center gap-1">
                    <ImageIcon size={11} />
                    {project.images_uploaded} Images
                  </span>
                )}
                {project.width !== undefined && project.width > 0 && (
                  <span className="flex items-center gap-1">
                    <Ruler size={11} />
                    {project.width.toFixed(1)}m × {project.length?.toFixed(1)}m
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <StatusBadge status="COMPLETED" size="sm" />
            <ChevronRight
              size={16}
              className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-cyan-600 transition-all"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

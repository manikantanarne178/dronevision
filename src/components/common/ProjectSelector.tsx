import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Calendar,
  Image as ImageIcon,
  Ruler,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../../utils/date";

const API = "http://127.0.0.1:8000";

interface Project {
  project_id: string;
  generated_at: string;
  images_uploaded: number;
  processing_time: number;
  width: number;
  length: number;
  height: number;
}

interface ProjectSelectorProps {
  title: string;
  subtitle: string;
  navigateTo: string;
}

export default function ProjectSelector({
  title,
  subtitle,
  navigateTo,
}: ProjectSelectorProps) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setProjects(res.data.projects);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50/50 px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-lg">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200">
          <Box className="text-cyan-600" size={28} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>

        <p className="mt-1.5 text-slate-500 text-sm">{subtitle}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="animate-spin text-cyan-600" size={18} />
          <span>Loading projects...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-rose-700 text-sm font-medium">
          Failed to load projects. Make sure the backend service is running.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center gap-2 text-slate-400 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <FolderOpen size={36} />
          <p className="text-sm text-slate-600 font-medium">
            No projects found. Upload drone images or drawings to begin.
          </p>
        </div>
      )}

      {/* Project List */}
      {!loading && !error && projects.length > 0 && (
        <div className="w-full max-w-3xl space-y-3">
          {projects.map((project) => (
            <button
              key={project.project_id}
              onClick={() => navigate(`${navigateTo}/${project.project_id}`)}
              className="group w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-left transition-all duration-200 hover:border-cyan-500 hover:shadow-md hover:bg-slate-50/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200">
                    <Box className="text-cyan-600" size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                      {project.project_id}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {project.generated_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(project.generated_at)}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <ImageIcon size={12} />
                        {project.images_uploaded} Images
                      </span>

                      {project.width !== undefined && project.width > 0 && (
                        <span className="flex items-center gap-1">
                          <Ruler size={12} />
                          {project.width?.toFixed(2)}m × {project.length?.toFixed(2)}m × {project.height?.toFixed(2)}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <StatusBadge status="COMPLETED" size="sm" />
                  <ChevronRight
                    className="text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-cyan-600"
                    size={18}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Calendar,
  Image,
  Ruler,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";

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
    <div className="flex h-full flex-col items-center justify-center bg-slate-950 px-6 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
          <Box className="text-cyan-400" size={32} />
        </div>

        <h1 className="text-3xl font-bold text-white">{title}</h1>

        <p className="mt-2 text-slate-400">{subtitle}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading projects...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
          Failed to load projects. Make sure the backend is running.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <FolderOpen size={40} />
          <p>No projects found. Upload drone images to get started.</p>
        </div>
      )}

      {/* Project List */}
      {!loading && !error && projects.length > 0 && (
        <div className="w-full max-w-3xl space-y-3">
          {projects.map((project) => (
            <button
              key={project.project_id}
              onClick={() =>
                navigate(`${navigateTo}/${project.project_id}`)
              }
              className="group w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                    <Box className="text-cyan-400" size={22} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {project.project_id}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      {project.generated_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(
                            project.generated_at
                          ).toLocaleDateString()}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Image size={11} />
                        {project.images_uploaded} Images
                      </span>

                      <span className="flex items-center gap-1">
                        <Ruler size={11} />
                        {project.width.toFixed(2)}m ×{" "}
                        {project.length.toFixed(2)}m ×{" "}
                        {project.height.toFixed(2)}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
                    Completed
                  </span>

                  <ChevronRight
                    className="text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
                    size={20}
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
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ChevronDown,
  FolderOpen,
  Check,
  Upload,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import DroneApiService, { type DroneProjectBackend } from "../../services/droneApiService";
import { useDroneSurvey } from "../../context/DroneSurveyContext";
import StatusBadge from "../common/StatusBadge";

interface DroneProjectBarProps {
  currentProjectId?: string;
  onProjectChange?: (projectId: string) => void;
  className?: string;
}

export const DroneProjectBar: React.FC<DroneProjectBarProps> = ({
  currentProjectId,
  onProjectChange,
  className = "",
}) => {
  const navigate = useNavigate();
  const { surveys, setActiveSurveyId } = useDroneSurvey();
  const [projects, setProjects] = useState<DroneProjectBackend[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await DroneApiService.listDroneProjects();
      
      // Merge with any in-memory active local survey if not already in list
      const merged: DroneProjectBackend[] = [...list];
      for (const s of surveys) {
        if (s.backendProjectId && !merged.some((p) => p.project_id === s.backendProjectId)) {
          merged.unshift({
            project_id: s.backendProjectId,
            name: s.name,
            generated_at: s.createdAt,
            images_uploaded: s.imageCount,
            width: s.boundingBox?.widthM || 0,
            length: s.boundingBox?.lengthM || 0,
            height: s.elevation?.deltaElevation || 0,
            dimensions: {
              width: s.boundingBox?.widthM || 0,
              length: s.boundingBox?.lengthM || 0,
              height: s.elevation?.deltaElevation || 0,
            },
            ground_area: s.areaSqm || 0,
            surface_area: s.areaSqm || 0,
            volume: 0,
            vertices: 0,
            triangles: 0,
            model_url: `/api/projects/${s.backendProjectId}/model`,
            report_url: `/api/projects/${s.backendProjectId}/report`,
            status: s.reconstructionStatus === "available" ? "COMPLETED" : "PROCESSING",
          });
        }
      }

      setProjects(merged);
    } catch (err: any) {
      console.warn("DroneProjectBar fetch notice:", err);
      setError("Unable to load drone projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [surveys]);

  const activeProject =
    projects.find((p) => p.project_id === currentProjectId) ||
    projects[0] ||
    null;

  const handleSelect = (project: DroneProjectBackend) => {
    setOpenDropdown(false);
    setActiveSurveyId(project.project_id);

    if (onProjectChange) {
      onProjectChange(project.project_id);
    } else {
      navigate(`/viewer/${project.project_id}`);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-30 ${className}`}
    >
      {/* Active Project Identification */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0 shadow-inner">
          <Camera size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-100/80 text-cyan-800">
              Active Drone Project
            </span>
            {activeProject && (
              <span className="font-mono text-xs font-bold text-slate-700">
                {activeProject.project_id}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
            {activeProject?.name || "No Drone Project Selected"}
          </h3>
        </div>
      </div>

      {/* Switcher & Badges */}
      <div
        ref={dropdownRef}
        className="flex items-center gap-2 self-end sm:self-auto shrink-0 relative"
      >
        {activeProject && (
          <StatusBadge status={activeProject.status || "COMPLETED"} size="sm" />
        )}

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
          >
            <FolderOpen size={14} className="text-cyan-700" />
            <span>Switch Project</span>
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform duration-200 ${
                openDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Select Drone Project ({projects.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/upload");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                >
                  <Upload size={11} />
                  + Upload New Dataset
                </button>
              </div>

              {/* Body */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
                {loading ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 gap-2 text-xs">
                    <Loader2 size={16} className="animate-spin text-cyan-600" />
                    <span>Loading real drone projects...</span>
                  </div>
                ) : error ? (
                  <div className="p-3 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-2 justify-center">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">No drone projects available</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upload aerial images to generate a 3D reconstruction.
                    </p>
                  </div>
                ) : (
                  projects.map((p) => {
                    const isSelected = activeProject?.project_id === p.project_id;

                    return (
                      <button
                        key={p.project_id}
                        onClick={() => handleSelect(p)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer border ${
                          isSelected
                            ? "bg-cyan-50/90 border-cyan-200 text-cyan-950 font-semibold shadow-2xs"
                            : "hover:bg-slate-50 border-transparent text-slate-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs truncate font-bold text-slate-900">
                              {p.name || `Survey ${p.project_id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-mono mt-0.5 flex-wrap">
                            <span className="font-bold text-slate-600">{p.project_id}</span>
                            <span>•</span>
                            <span className="text-cyan-800 font-sans font-semibold">
                              {p.images_uploaded || 0} Images
                            </span>
                            {p.vertices && p.vertices > 0 ? (
                              <>
                                <span>•</span>
                                <span className="text-slate-500 font-sans">
                                  {p.vertices.toLocaleString()} pts
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={p.status || "COMPLETED"} size="sm" />
                          {isSelected && (
                            <Check size={15} className="text-cyan-600 shrink-0 ml-1" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer action */}
              <div className="px-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/upload");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-cyan-800 font-bold text-xs border border-slate-200/80 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-cyan-600" />
                  <span>+ Ingest New Drone Survey Dataset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneProjectBar;

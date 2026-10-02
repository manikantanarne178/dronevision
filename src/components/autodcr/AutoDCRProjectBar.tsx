import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  FolderOpen,
  Check,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AutoDCRProject } from "../../types/autodcr";
import StatusBadge from "../common/StatusBadge";

interface AutoDCRProjectBarProps {
  currentProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

export const AutoDCRProjectBar: React.FC<AutoDCRProjectBarProps> = ({
  currentProjectId,
  onProjectChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<AutoDCRProject[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeProject, setActiveProject] = useState<AutoDCRProject | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res: any = await AutoDCRService.listProjects();
        const list: AutoDCRProject[] = Array.isArray(res) ? res : res?.projects || [];
        setProjects(list);

        const currentId =
          currentProjectId ||
          new URLSearchParams(location.search).get("file_id") ||
          localStorage.getItem("current_file_id") ||
          "";

        if (currentId && list.length > 0) {
          const found = list.find(
            (p) =>
              p.project_id === currentId ||
              p.stored_filename === currentId ||
              p.id === currentId
          );
          if (found) {
            setActiveProject(found);
          } else {
            // Default to first real project if available
            setActiveProject(list[0]);
          }
        } else if (list.length > 0) {
          setActiveProject(list[0]);
        }
      } catch (err) {
        console.error("Failed to load project bar:", err);
      }
    };

    fetchProjects();
  }, [currentProjectId, location.search]);

  const handleSelect = (p: AutoDCRProject) => {
    const id = p.project_id || p.id || p.stored_filename || "";
    setActiveProject(p);
    localStorage.setItem("current_file_id", id);
    if (p.filename || p.original_filename) {
      localStorage.setItem("current_filename", p.filename || p.original_filename || "");
    }
    setOpenDropdown(false);

    if (onProjectChange) {
      onProjectChange(id);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("file_id", id);
      navigate(`${url.pathname}?${url.searchParams.toString()}`);
    }
  };

  if (!activeProject && projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
          <Building2 size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-100/80 text-cyan-800">
              Active Scrutiny Project
            </span>
            {activeProject && (
              <span className="font-mono text-xs font-bold text-slate-700">
                {activeProject.project_id || activeProject.project_code}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
            {activeProject?.name || "No Project Selected"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 relative">
        {activeProject && (
          <StatusBadge status={activeProject.status || "PROCESSING"} size="sm" />
        )}

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all border border-slate-200/80 cursor-pointer"
          >
            <FolderOpen size={13} className="text-cyan-700" />
            <span>Switch Project</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Select Project ({projects.length})
                </span>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/autodcr/upload");
                  }}
                  className="text-[11px] font-semibold text-cyan-700 hover:underline cursor-pointer"
                >
                  + Upload New
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                {projects.map((p) => {
                  const id = p.project_id || p.id || p.stored_filename || "";
                  const isSelected = activeProject?.project_id === p.project_id;

                  return (
                    <button
                      key={id}
                      onClick={() => handleSelect(p)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-50/80 text-cyan-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs truncate font-medium">
                          {p.name || p.filename || "Plan Drawing"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {p.project_id} • {p.zone || "Residential"}
                        </p>
                      </div>

                      {isSelected && (
                        <Check size={14} className="text-cyan-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoDCRProjectBar;

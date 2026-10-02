import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  FileText,
  Search,
  UploadCloud,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  MapPin,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AutoDCRProject } from "../../types/autodcr";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/date";

interface AutoDCRProjectPickerProps {
  title?: string;
  subtitle?: string;
  onSelectProject?: (projectId: string) => void;
  selectedProjectId?: string;
}

export const AutoDCRProjectPicker: React.FC<AutoDCRProjectPickerProps> = ({
  title = "Select Project for Scrutiny",
  subtitle = "Choose a registered municipal drawing project from your repository to execute analysis.",
  onSelectProject,
  selectedProjectId,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AutoDCRProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await AutoDCRService.listProjects();
      const list = Array.isArray(res) ? res : res?.projects || [];
      setProjects(list);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setError("Unable to load projects from server. Please check your backend connection.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSelect = (p: AutoDCRProject) => {
    const id = p.project_id || p.id || p.stored_filename || "";
    localStorage.setItem("current_file_id", id);
    if (p.filename || p.original_filename) {
      localStorage.setItem("current_filename", p.filename || p.original_filename || "");
    }
    if (onSelectProject) {
      onSelectProject(id);
    } else {
      // Reload current route with query param
      const url = new URL(window.location.href);
      url.searchParams.set("file_id", id);
      window.location.assign(url.pathname + url.search);
    }
  };

  const filtered = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.project_id || "").toLowerCase().includes(term) ||
      (p.project_code || "").toLowerCase().includes(term) ||
      (p.filename || p.original_filename || "").toLowerCase().includes(term) ||
      (p.zone || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
            <FolderOpen size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadProjects}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => navigate("/autodcr/upload")}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UploadCloud size={14} /> Upload New Drawing
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          placeholder="Search by project name, ID, file, zone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 transition-colors"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <p className="text-xs sm:text-sm text-rose-700 font-medium">{error}</p>
          <button
            onClick={loadProjects}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Retry Loading
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-4 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mx-auto">
            <Building2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No AutoDCR Projects Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You haven't uploaded any CAD/BIM drawing plans yet. Upload your first drawing to start scrutiny.
            </p>
          </div>
          <button
            onClick={() => navigate("/autodcr/upload")}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <UploadCloud size={16} /> Upload Drawing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Registered Projects ({filtered.length})</span>
            <span>Click any project to select & analyze</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((p) => {
              const id = p.project_id || p.id || p.stored_filename || "";
              const isSelected = selectedProjectId === id;

              return (
                <div
                  key={id}
                  onClick={() => handleSelect(p)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-50/40 ring-2 ring-cyan-600/10 shadow-xs"
                      : "border-slate-200 bg-white hover:border-cyan-500 hover:shadow-xs hover:bg-slate-50/60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200/80">
                        {p.project_id || p.project_code || "DCR Project"}
                      </span>
                      <StatusBadge status={p.status || "PROCESSING"} size="sm" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {p.name || `Plan Scrutiny - ${p.filename || "Drawing"}`}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 truncate flex items-center gap-1.5">
                        <FileText size={12} className="text-slate-400 shrink-0" />
                        {p.filename || p.original_filename || p.stored_filename || "drawing.dxf"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {p.zone || "Residential"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        {formatDate(p.created_at || p.uploaded_at || p.updated_at)}
                      </span>
                    </div>

                    <span className="font-bold text-cyan-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-xs">
                      Select Project <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && projects.length > 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No projects match "{searchTerm}". Try a different search keyword.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoDCRProjectPicker;

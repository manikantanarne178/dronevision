import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderGit2,
  Search,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Building2,
  Calendar,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AutoDCRProject } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/date";
import "./AutoDCRProjects.css";

export default function AutoDCRProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<AutoDCRProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.listProjects();
      setProjects(res.projects || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || err.message || "Failed to load projects from server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name || id}"?`)) return;
    try {
      await AutoDCRService.deleteProject(id);
      const activeId = localStorage.getItem("current_file_id");
      if (activeId === id || activeId?.includes(id)) {
        localStorage.removeItem("current_file_id");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id && p.file_id !== id));
      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete project: " + (err.response?.data?.detail || err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="autodcr-projects-container space-y-6">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProjects} />;
  }

  const filtered = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.file_id || "").toLowerCase().includes(term) ||
      (p.zone || "").toLowerCase().includes(term) ||
      (p.id || "").toLowerCase().includes(term) ||
      (p.file_type || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="autodcr-projects-container space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderGit2 className="text-cyan-600" size={22} />
              AutoDCR Project Management
            </h1>
            <StatusBadge status="ACTIVE" label={`${projects.length} Registered`} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Active architectural drawing scrutiny records & municipal compliance files
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProjects}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/autodcr/upload"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} /> New Drawing Project
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              placeholder="Search by file name, project ID, zone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-1.5 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 transition-colors"
            />
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No AutoDCR Projects Yet"
            description="Upload your first architectural drawing or CAD model (DXF, DWG, IFC, PDF) to begin automated municipal plan scrutiny."
            actionText="Upload First Drawing"
            onAction={() => navigate("/autodcr/upload")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Project Details</th>
                  <th>File Reference</th>
                  <th>Jurisdiction Zone</th>
                  <th>Uploaded Date</th>
                  <th>Scrutiny Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => {
                  const projId = p.id || p.file_id;
                  const uploadDate = p.created_at || p.uploaded_at || p.updated_at;
                  return (
                    <tr key={projId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                            <Building2 size={18} />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {p.name || `Project ${projId}`}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {p.owner_name || p.plot_number || "Municipal Scrutiny Queue"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                          <FileCode className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span className="truncate max-w-[180px]" title={p.file_id || p.name}>
                            {p.file_id || p.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {p.zone || "Residential"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {formatDate(uploadDate)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={p.status || "COMPLETED"} size="sm" />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              navigate(
                                `/autodcr/validate?file_id=${encodeURIComponent(
                                  p.file_id || projId
                                )}`
                              )
                            }
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-cyan-700 transition-all cursor-pointer"
                            title="View Scrutiny Results"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(projId, p.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                            title="Delete Project File"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <EmptyState
                        title="No Matching Projects"
                        description="No project records match your search filter criteria."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages} ({filtered.length} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-50 cursor-pointer font-medium"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-50 cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

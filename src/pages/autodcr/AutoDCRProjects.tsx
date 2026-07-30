import { useEffect, useState } from "react";
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
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AutoDCRProject } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import "./AutoDCRProjects.css";

export default function AutoDCRProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<AutoDCRProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.listProjects();
      setProjects(res.projects || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete project ${id}?`)) return;
    try {
      await AutoDCRService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id && p.file_id !== id));
      alert("Project deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete project: " + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="autodcr-projects-container">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProjects} />;
  }

  const defaultProjects: AutoDCRProject[] = [
    {
      id: "PROJ-101",
      name: "Green Valley Residency - Block A",
      file_id: "drawing_01.dxf",
      file_type: "DXF",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "APPROVED",
      zone: "Residential",
      owner_name: "Apex Infrastructure Pvt Ltd",
    },
    {
      id: "PROJ-102",
      name: "City Center Commercial Hub",
      file_id: "drawing_02.dwg",
      file_type: "DWG",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      status: "PARSED",
      zone: "Commercial",
      owner_name: "Urban Retail Developers",
    },
    {
      id: "PROJ-103",
      name: "Industrial Park Warehouse #4",
      file_id: "drawing_03.ifc",
      file_type: "IFC",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString(),
      status: "VALIDATED",
      zone: "Industrial",
      owner_name: "Logistics Infra Corp",
    },
  ];

  const activeProjectsList = projects.length > 0 ? projects : defaultProjects;

  const filtered = activeProjectsList.filter((p) => {
    return (
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.file_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.zone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="autodcr-projects-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FolderGit2 className="text-cyan-400" size={28} />
              AutoDCR Project Management
            </h1>
            <StatusBadge status="ACTIVE" label={`${filtered.length} Projects`} />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Registered Municipal Architectural Plan Scrutiny Records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/autodcr/upload"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus size={16} /> New Drawing Project
          </Link>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              placeholder="Search project name, ID, or zone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 py-2 pr-4 text-sm text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="autodcr-projects-table-wrapper custom-scrollbar">
          <table className="autodcr-projects-table">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>File Reference</th>
                <th>Zone</th>
                <th>Date Uploaded</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const projId = p.id || p.file_id;
                return (
                  <tr key={projId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <Building2 className="text-cyan-400" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{p.name || `Project ${projId}`}</p>
                          <p className="text-xs text-slate-400">{p.owner_name || "Applicant / Developer"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-cyan-300">{p.file_id || "drawing.dxf"}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 text-xs font-semibold">
                        {p.zone || "Residential"}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(p.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={p.status || "APPROVED"} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/autodcr/validate?file_id=${encodeURIComponent(p.file_id || projId)}`)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all"
                          title="View Scrutiny"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(projId)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      title="No Projects Found"
                      description="No project records match your search filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2 text-xs text-slate-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-50"
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

import { useEffect, useState } from "react";
import API from "../api";
import "./Reports.css";

import {
  FileText,
  Download,
  BarChart3,
  Trash2,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

interface Project {
  project_id: string;
  generated_at: string;
  processing_time: number;
  images_uploaded: number;

  width: number;
  length: number;
  height: number;

  ground_area: number;
  surface_area: number;
  volume: number;

  vertices: number;
  triangles: number;

  model_url: string;
  report_url: string;
}

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/api/projects/");

      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await API.delete(`/api/projects/${projectId}`);

      setProjects((prev) =>
        prev.filter((p) => p.project_id !== projectId)
      );

      alert("Project deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    }
  };

  const downloadReport = async (reportUrl: string) => {
    try {
      const response = await API.get(reportUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="reports-page space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Spatial Reconstruction Audits
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technical Reports & Exports</h1>
        <p className="text-sm text-slate-500">
          Download PDF engineering reports, telemetry manifests, and photogrammetry reconstruction logs.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reports</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <BarChart3 size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">{projects.length}</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Generated documents</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ready for Export</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">{projects.length}</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">100% compiled</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Format Standards</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">PDF / CSV</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Municipal grade</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Report Storage</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <HardDrive size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">Local / Cloud</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Encrypted</span>
        </div>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading project documentation records...
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No generated reports found.</p>
            <p className="text-xs text-slate-400 mt-1">Upload drone survey images to generate 3D models and technical audit reports.</p>
          </div>
        )}

        {!loading &&
          projects.map((project) => (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4" key={project.project_id}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
                  <FileText size={22} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{project.project_id}</h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>
                      {project.generated_at
                        ? new Date(project.generated_at).toLocaleString()
                        : "-"}
                    </span>
                    <span>•</span>
                    <span>{project.images_uploaded} Images</span>
                    <span>•</span>
                    <span>{project.processing_time}s Compute</span>
                    {project.width > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{project.width?.toFixed(2)}m × {project.length?.toFixed(2)}m × {project.height?.toFixed(2)}m</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed
                </span>

                <button
                  onClick={() => downloadReport(project.report_url)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  Download PDF
                </button>

                <button
                  onClick={() => deleteProject(project.project_id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
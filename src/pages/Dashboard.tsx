import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DroneApiService, { type DroneProjectBackend } from "../services/droneApiService";
import {
  Image,
  Box,
  FolderOpen,
  HardDrive,
  Upload,
  ArrowRight,
  ShieldCheck,
  Route,
  MapPin,
  Calendar,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import { useDroneSurvey } from "../context/DroneSurveyContext";

export default function Dashboard() {
  const {
    surveys,
    activeSurvey,
    setActiveSurveyId,
    deleteSurvey,
  } = useDroneSurvey();
  const [backendProjects, setBackendProjects] = useState<DroneProjectBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await DroneApiService.listDroneProjects();
      setBackendProjects(list);
    } catch (err: any) {
      console.warn("Backend projects fetch notice:", err);
      setError("Unable to load drone projects from backend (https://dronbackend.onrender.com).");
    } finally {
      setLoading(false);
    }
  };

  const totalSurveys = Math.max(surveys.length, backendProjects.length);

  const totalImages =
    backendProjects.reduce((sum, p) => sum + (p.images_uploaded || 0), 0) ||
    surveys.reduce((sum, s) => sum + s.imageCount, 0);

  const totalModels =
    backendProjects.filter((p) => p.model_url || (p.vertices && p.vertices > 0)).length ||
    surveys.filter((s) => s.reconstructionStatus === "available").length;

  const totalStorageMB = surveys.reduce(
    (sum, s) =>
      sum + s.images.reduce((isum, img) => isum + img.fileSize, 0) / (1024 * 1024),
    0
  );
  const storageStr =
    totalStorageMB > 1024
      ? `${(totalStorageMB / 1024).toFixed(2)} GB`
      : totalStorageMB > 0
      ? `${totalStorageMB.toFixed(1)} MB`
      : totalModels > 0
      ? `${(totalModels * 1.2).toFixed(1)} MB`
      : "0 MB";

  const handleSelectProject = (projectId: string) => {
    const match = surveys.find((s) => s.backendProjectId === projectId || s.id === projectId);
    if (match) {
      setActiveSurveyId(match.id);
    } else {
      setActiveSurveyId(projectId);
    }
    navigate(`/viewer/${projectId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              DroneVision Aerial Photogrammetry
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              Production Pipeline
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Georeferenced drone survey processing, 3D SfM photogrammetry, and spatial analytics
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0"
        >
          <Upload size={16} />
          Upload Drone Survey
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Surveys"
          value={loading ? "..." : totalSurveys.toString()}
          icon={FolderOpen}
          color="cyan"
          subtitle="Real Drone Missions"
        />

        <StatCard
          title="Aerial Images"
          value={loading ? "..." : totalImages.toString()}
          icon={Image}
          color="indigo"
          subtitle="Processed Frames"
        />

        <StatCard
          title="3D Reconstructions"
          value={loading ? "..." : totalModels.toString()}
          icon={Box}
          color="emerald"
          subtitle="Interactive 3D Meshes"
        />

        <StatCard
          title="Storage Consumed"
          value={loading ? "..." : storageStr}
          icon={HardDrive}
          color="amber"
          subtitle="Survey Payload"
        />
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Real Drone Projects table from backend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Route className="text-cyan-600" size={18} />
              Real Drone Projects ({backendProjects.length})
            </h3>
            <Link
              to="/flight-path"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              Open Flight Path <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Loading drone projects from backend...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Backend Connection Notice</p>
                <p className="text-rose-600">{error}</p>
              </div>
            </div>
          ) : backendProjects.length === 0 && surveys.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No drone projects available</p>
              <p className="text-xs text-slate-400 mt-1">Upload aerial imagery to generate georeferenced flight paths and 3D models.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {backendProjects.map((proj) => {
                const isSelected = activeSurvey?.backendProjectId === proj.project_id || activeSurvey?.id === proj.project_id;

                return (
                  <div
                    key={proj.project_id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                        <Box size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectProject(proj.project_id)}
                            className="font-bold text-slate-900 text-xs sm:text-sm truncate hover:text-cyan-700 text-left cursor-pointer"
                          >
                            {proj.name || `Survey ${proj.project_id}`}
                          </button>
                          <span className="font-mono text-[11px] text-slate-500">
                            {proj.project_id}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          {proj.generated_at && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(proj.generated_at).toLocaleDateString()}
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{proj.images_uploaded || 0} Images</span>
                          {proj.vertices && proj.vertices > 0 ? (
                            <>
                              <span>•</span>
                              <span className="text-cyan-700 font-medium font-mono">
                                {proj.vertices.toLocaleString()} Vertices
                              </span>
                            </>
                          ) : null}
                          {proj.surface_area && proj.surface_area > 0 ? (
                            <>
                              <span>•</span>
                              <span className="font-mono text-emerald-700">
                                {proj.surface_area.toLocaleString()} m²
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={proj.status || "COMPLETED"} size="sm" />
                      <button
                        onClick={() => handleSelectProject(proj.project_id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye size={12} />
                        <span>Launch 3D</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete project ${proj.project_id}?`)) {
                            await deleteSurvey(proj.project_id);
                            loadProjects();
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col: AutoDCR Integration & Capabilities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="text-cyan-600" size={18} />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Connected AutoDCR Pipeline
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              DroneVision outputs verified georeferenced boundaries, building footprints, and road frontage geometry for automated municipal scrutiny against local building bylaws.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Live API Base:</span>
                <span className="font-mono text-[11px] font-bold text-cyan-700">dronbackend.onrender.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinate Datum:</span>
                <span className="font-bold text-slate-800">WGS84 (EPSG:4326)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Photogrammetry:</span>
                <span className="font-bold text-emerald-700">SfM Open3D / COLMAP</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/autodcr-dashboard"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs transition-all border border-cyan-200"
            >
              Switch to AutoDCR Scrutiny <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
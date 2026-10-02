import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
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
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import { useDroneSurvey } from "../context/DroneSurveyContext";

export default function Dashboard() {
  const {
    surveys,
    activeSurvey,
    setActiveSurveyId,
    deleteSurvey,
  } = useDroneSurvey();
  const [backendProjects, setBackendProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/api/projects/");
      if (res.data?.success && Array.isArray(res.data.projects)) {
        setBackendProjects(res.data.projects);
      } else if (Array.isArray(res.data)) {
        setBackendProjects(res.data);
      }
    } catch (err) {
      console.warn("Backend projects fetch notice:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalSurveys = Math.max(surveys.length, backendProjects.length);

  const totalImages =
    surveys.reduce((sum, s) => sum + s.imageCount, 0) ||
    backendProjects.reduce((sum, p) => sum + (p.images_uploaded || 0), 0);

  const totalModels =
    surveys.filter((s) => s.reconstructionStatus === "available").length ||
    backendProjects.filter((p) => p.model_url).length;

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
      : `${(totalModels * 0.85).toFixed(1)} GB`;

  const handleSelectSurvey = (surveyId: string) => {
    setActiveSurveyId(surveyId);
    navigate("/flight-path");
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
              Autonomous Ingestion
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Georeferenced drone survey processing, flight path reconstruction, and site spatial analysis
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
          subtitle="Processed Missions"
        />

        <StatCard
          title="Aerial Images"
          value={loading ? "..." : totalImages.toString()}
          icon={Image}
          color="indigo"
          subtitle="Geotagged Aerial Frames"
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
          subtitle="Survey & Model Payload"
        />
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent drone surveys table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Route className="text-cyan-600" size={18} />
              Recent Drone Surveys & Missions
            </h3>
            <Link
              to="/flight-path"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              Open Flight Path <ArrowRight size={13} />
            </Link>
          </div>

          {surveys.length === 0 && backendProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">0 Surveys Processed</p>
              <p className="text-xs text-slate-400 mt-1">Upload aerial imagery to generate georeferenced flight paths and 3D models.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                      <Route size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectSurvey(survey.id)}
                          className="font-bold text-slate-900 text-xs sm:text-sm truncate hover:text-cyan-700 text-left cursor-pointer"
                        >
                          {survey.name}
                        </button>
                        {survey.id === activeSurvey?.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{survey.imageCount} Images</span>
                        {survey.geotaggedImageCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-700 font-medium font-mono">
                              {survey.geotaggedImageCount} Geotagged
                            </span>
                          </>
                        )}
                        {survey.areaSqm > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-700">
                              {survey.areaSqm.toLocaleString()} m²
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectSurvey(survey.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => deleteSurvey(survey.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete survey"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
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
                <span className="font-bold text-emerald-700">EXIF + SfM Cloud</span>
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
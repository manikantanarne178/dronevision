import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  Image,
  Box,
  FolderOpen,
  HardDrive,
  Upload,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";

interface Project {
  project_id: string;
  images_uploaded: number;
  model_url?: string;
  generated_at?: string;
  width?: number;
  length?: number;
  height?: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/api/projects/");
      if (res.data?.success && Array.isArray(res.data.projects)) {
        setProjects(res.data.projects);
      } else if (Array.isArray(res.data)) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Failed to load projects from live backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalProjects = projects.length;

  const totalImages = projects.reduce(
    (sum, p) => sum + (p.images_uploaded || 0),
    0
  );

  const totalModels = projects.filter((p) => p.model_url).length;

  const storage = `${(totalModels * 0.85).toFixed(1)} GB`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              DroneVision AI Mapping Overview
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              3D Photogrammetry
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Aerial drone image processing, 3D mesh reconstruction & spatial calculations
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
          value={loading ? "..." : totalProjects.toString()}
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
          value={loading ? "..." : storage}
          icon={HardDrive}
          color="amber"
          subtitle="Mesh & Orthomosaic Data"
        />
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent projects list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Box className="text-cyan-600" size={18} />
              Recent Drone Surveys & 3D Models
            </h3>
            <Link
              to="/viewer"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              Open 3D Viewer <ArrowRight size={13} />
            </Link>
          </div>

          <RecentProjects projects={projects} />
        </div>

        {/* Right col: Quick info and AutoDCR link */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="text-cyan-600" size={18} />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Connected AutoDCR Suite
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              DroneVision works natively with the municipal AutoDCR regulation engine to verify building heights, setbacks, and plot boundaries from aerial photogrammetry.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pipeline Status:</span>
                <span className="font-bold text-emerald-700">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinate Sync:</span>
                <span className="font-bold text-slate-800">WGS84 & UTM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Export Formats:</span>
                <span className="font-bold text-slate-800">OBJ, GLTF, DXF, PDF</span>
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
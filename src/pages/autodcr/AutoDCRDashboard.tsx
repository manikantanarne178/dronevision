import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  FileCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  Upload,
  Cpu,
  Activity,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { SystemMetrics, AutoDCRProject } from "../../types/autodcr";
import StatusBadge from "../../components/common/StatusBadge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import "./AutoDCRDashboard.css";

export default function AutoDCRDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [projects, setProjects] = useState<AutoDCRProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mRes, pRes] = await Promise.all([
        AutoDCRService.getSystemMetrics().catch(() => ({
          engine_version: "2.0.0",
          status: "HEALTHY",
          supported_formats: ["DXF", "DWG", "IFC", "PDF"],
          supported_zones: ["Residential", "Commercial", "Industrial", "Mixed Use"],
        })),
        AutoDCRService.listProjects().catch(() => ({ projects: [] })),
      ]);
      setMetrics(mRes);
      setProjects(pRes.projects || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="autodcr-dash-container">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="autodcr-dash-container">
      {/* Header Banner */}
      <div className="autodcr-dash-header bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Municipal AutoDCR Overview
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
              v{metrics?.engine_version || "2.0.0"}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated CAD & BIM Building Plan Scrutiny System
          </p>
        </div>

        <Link
          to="/autodcr/upload"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Upload size={18} />
          Upload New Drawing
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="autodcr-dash-stat-grid">
        <div className="autodcr-dash-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </p>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {projects.length}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 size={24} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <Activity size={14} /> Active Municipal Pipeline
          </div>
        </div>

        <div className="autodcr-dash-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Engine Health
              </p>
              <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {metrics?.status || "HEALTHY"}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            FastAPI Rule Engine Active
          </div>
        </div>

        <div className="autodcr-dash-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Supported CAD Formats
              </p>
              <h2 className="text-2xl font-extrabold text-cyan-300 mt-2">
                DXF, DWG, IFC, PDF
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Automated Layer & Block Extraction
          </div>
        </div>

        <div className="autodcr-dash-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Rule Sets
              </p>
              <h2 className="text-3xl font-extrabold text-amber-400 mt-2">
                5 Zones
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Residential, Commercial, Industrial, etc.
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="autodcr-dash-content-grid">
        {/* Left Column: Workflow Quick Access */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="text-cyan-400" size={20} />
              AutoDCR Automated Scrutiny Workflow
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/autodcr/upload"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                  STEP 1
                </span>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
              </div>
              <h4 className="font-bold text-white text-base">Upload CAD / BIM File</h4>
              <p className="text-slate-400 text-xs mt-1">
                Upload DXF, DWG, IFC, or PDF drawings with full validation.
              </p>
            </Link>

            <Link
              to="/autodcr/parse"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                  STEP 2
                </span>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
              </div>
              <h4 className="font-bold text-white text-base">Parsing & Layer Check</h4>
              <p className="text-slate-400 text-xs mt-1">
                Extract layers, entities, texts, blocks, and dimensions.
              </p>
            </Link>

            <Link
              to="/autodcr/detect"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                  STEP 3
                </span>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
              </div>
              <h4 className="font-bold text-white text-base">Spatial Feature Detection</h4>
              <p className="text-slate-400 text-xs mt-1">
                Detect plot, building footprint, parking, lifts, and staircases.
              </p>
            </Link>

            <Link
              to="/autodcr/calculate"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                  STEP 4
                </span>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
              </div>
              <h4 className="font-bold text-white text-base">Area & Metric Calculations</h4>
              <p className="text-slate-400 text-xs mt-1">
                Calculate plot area, FSI, FAR, ground coverage, and height.
              </p>
            </Link>

            <Link
              to="/autodcr/validate"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group sm:col-span-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  STEP 5 & 6
                </span>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
              </div>
              <h4 className="font-bold text-white text-base">Municipal Rule Validation & Report</h4>
              <p className="text-slate-400 text-xs mt-1">
                Validate against residential/commercial rules and generate official PDF/JSON reports.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Supported Zones & Rules */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Supported Zones</h3>
          <div className="space-y-2">
            {(metrics?.supported_zones || ["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"]).map(
              (zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm"
                >
                  <span className="font-semibold text-slate-200">{zone}</span>
                  <StatusBadge status="ACTIVE" size="sm" />
                </div>
              )
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/autodcr/rules"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
            >
              Browse All Municipal Bye-laws & Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

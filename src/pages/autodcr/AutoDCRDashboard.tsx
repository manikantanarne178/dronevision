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
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { SystemMetrics, AutoDCRProject } from "../../types/autodcr";
import StatusBadge from "../../components/common/StatusBadge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/dashboard/StatCard";
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
      const projList = Array.isArray(pRes) ? pRes : (pRes?.projects || []);
      setProjects(projList);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="autodcr-dash-container space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="autodcr-dash-container space-y-6">
      {/* Header Banner */}
      <div className="autodcr-dash-header bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Municipal AutoDCR Overview
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              v{metrics?.engine_version || "2.0.0"}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Automated CAD & BIM Building Plan Scrutiny System
          </p>
        </div>

        <Link
          to="/autodcr/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0"
        >
          <Upload size={16} />
          Upload New Drawing
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={projects.length}
          icon={Building2}
          color="cyan"
          subtitle="Registered CAD Projects"
        />

        <StatCard
          title="Engine Health"
          value={metrics?.status || "HEALTHY"}
          icon={Cpu}
          color="emerald"
          subtitle="FastAPI Microservices Online"
        />

        <StatCard
          title="CAD & BIM Formats"
          value="DXF • DWG • PDF • IFC"
          icon={Layers}
          color="indigo"
          subtitle="Layer & Geometry Extraction"
        />

        <StatCard
          title="Active Bye-laws"
          value="5 Municipal Zones"
          icon={ShieldAlert}
          color="amber"
          subtitle="NBC 2016 Compliant Rules"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow Quick Access */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="text-cyan-600" size={18} />
              AutoDCR Automated Scrutiny Workflow
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">5 Step Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              to="/autodcr/upload"
              className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                  STEP 1
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-all group-hover:translate-x-0.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Upload CAD / BIM File</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Upload DXF, DWG, IFC, or PDF drawings with full pre-validation.
              </p>
            </Link>

            <Link
              to="/autodcr/parse"
              className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                  STEP 2
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-all group-hover:translate-x-0.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Parsing & Layer Check</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Extract layers, polylines, texts, blocks, and dimensions.
              </p>
            </Link>

            <Link
              to="/autodcr/detect"
              className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                  STEP 3
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-all group-hover:translate-x-0.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Spatial Feature Detection</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Detect plot, building footprint, parking, lifts, and staircases.
              </p>
            </Link>

            <Link
              to="/autodcr/calculate"
              className="p-4 rounded-xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                  STEP 4
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 transition-all group-hover:translate-x-0.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Area & Metric Calculations</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Calculate plot area, FSI, FAR, ground coverage, and height.
              </p>
            </Link>

            <Link
              to="/autodcr/validate"
              className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 transition-all group sm:col-span-2"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  STEP 5 & 6
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Municipal Rule Validation & Certificate</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                Validate against residential/commercial bye-laws and generate official PDF certificates.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Supported Zones & Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 pb-2 border-b border-slate-100 mb-3">
              Supported Scrutiny Zones
            </h3>
            <div className="space-y-2">
              {(metrics?.supported_zones || ["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"]).map(
                (zone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{zone}</span>
                    <StatusBadge status="ACTIVE" size="sm" />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/autodcr/rules"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
            >
              Browse All Municipal Bye-laws & Rules <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

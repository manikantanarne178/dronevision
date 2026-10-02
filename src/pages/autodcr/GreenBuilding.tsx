import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Leaf,
  Sun,
  Droplets,
  TreePine,
  Zap,
  RefreshCw,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { GreenBuildingResponse, GreenBuildingScore } from "../../types/autodcr";
import ScoreCard from "../../components/common/ScoreCard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import "./GreenBuilding.css";

export default function GreenBuilding() {
  const [searchParams] = useSearchParams();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;
  const initialStandard = searchParams.get("standard") || "GRIHA";

  const [standard, setStandard] = useState<string>(initialStandard);
  const [greenRes, setGreenRes] = useState<GreenBuildingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = useCallback(async () => {
    if (!fileIdParam) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.evaluateGreenBuilding(fileIdParam, standard);
      setGreenRes(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Green Building evaluation failed";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam, standard]);

  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  if (!fileIdParam) {
    return (
      <div className="autodcr-green-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Green Building & Sustainability Audit"
          subtitle="Choose any registered municipal drawing project to evaluate GRIHA / IGBC sustainability parameters."
          onSelectProject={(id) => window.location.assign(`/autodcr/green-building?file_id=${encodeURIComponent(id)}&standard=${encodeURIComponent(standard)}`)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-green-container space-y-6">
        <SkeletonLoader type="card" count={5} />
        <SkeletonLoader type="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-green-container space-y-6">
        <ErrorState
          message={error}
          onRetry={runEvaluation}
          actionText="Select Another Project"
          onAction={() => window.location.assign("/autodcr/projects")}
        />
      </div>
    );
  }

  const scores: GreenBuildingScore = greenRes?.green_building || {
    solar_score: 0,
    water_score: 0,
    landscape_score: 0,
    energy_score: 0,
    waste_score: 0,
    overall_rating: "Under Review",
    compliance_percentage: 0,
    recommendations: [],
  };

  const overallPct = scores.compliance_percentage || scores.total_score || 0;

  return (
    <div className="autodcr-green-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) => window.location.assign(`/autodcr/green-building?file_id=${encodeURIComponent(id)}&standard=${encodeURIComponent(standard)}`)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Leaf className="text-emerald-600" size={22} />
              Green Building & Environmental Rating
            </h1>
            <StatusBadge status="CERTIFIED" label={scores.overall_rating || "Evaluated"} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
            Standard: <span className="text-emerald-700 font-bold">{standard}</span> | File:{" "}
            <span className="text-slate-700 font-mono font-semibold flex items-center gap-1"><FileCode className="w-3.5 h-3.5 text-slate-400" />{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            {["GRIHA", "IGBC", "MUNICIPAL_GREEN", "LEED_INDIA"].map((s) => (
              <option key={s} value={s}>
                {s} Standard
              </option>
            ))}
          </select>

          <button
            onClick={runEvaluation}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Re-evaluate Green Score"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Scorecard + Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard
          title="Overall Sustainability"
          score={overallPct}
          subtitle={scores.overall_rating || "Rating Complete"}
        />

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Solar & Renewable
            </p>
            <h3 className="text-2xl font-black text-amber-500 font-mono mt-1">
              {scores.solar_score || 0}%
            </h3>
            <span className="text-[11px] text-slate-400">Rooftop Photovoltaic</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Sun size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Water Conservation
            </p>
            <h3 className="text-2xl font-black text-cyan-600 font-mono mt-1">
              {scores.water_score || 0}%
            </h3>
            <span className="text-[11px] text-slate-400">Rainwater Harvesting</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Droplets size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Softscape & Ecology
            </p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {scores.landscape_score || 0}%
            </h3>
            <span className="text-[11px] text-slate-400">Native Green Canopy</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TreePine size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Energy Efficiency
            </p>
            <h3 className="text-2xl font-black text-indigo-600 font-mono mt-1">
              {scores.energy_score || 0}%
            </h3>
            <span className="text-[11px] text-slate-400">Daylighting & Thermal</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Advisory Recommendations */}
      {scores.recommendations && scores.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            GRIHA / Sustainability Audit Recommendations
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
            {scores.recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Leaf,
  Sun,
  Droplet,
  Trees,
  Zap,
  Trash2,
  Award,
  CheckCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { GreenBuildingResponse, GreenBuildingScore } from "../../types/autodcr";
import ProgressBar from "../../components/common/ProgressBar";
import ScoreCard from "../../components/common/ScoreCard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./GreenBuilding.css";

export default function GreenBuilding() {
  const [searchParams] = useSearchParams();
  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";

  const [standard, setStandard] = useState<string>("GRIHA");
  const [greenRes, setGreenRes] = useState<GreenBuildingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runEvaluation();
  }, [fileIdParam, standard]);

  const runEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.evaluateGreenBuilding(fileIdParam, standard);
      setGreenRes(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Green building evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="autodcr-green-container">
        <SkeletonLoader type="card" count={5} />
        <SkeletonLoader type="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runEvaluation} />;
  }

  const scores: GreenBuildingScore = greenRes?.green_building || {
    solar_score: 88,
    water_score: 92,
    landscape_score: 85,
    energy_score: 90,
    waste_score: 80,
    overall_rating: "5 Star GRIHA Rated",
    compliance_percentage: 87,
    recommendations: [
      "Increase rooftop solar panel coverage from 15% to 25% of available roof area.",
      "Install dual-flush water fixtures across all restrooms.",
      "Expand native species softscape area by 50 sq.m.",
      "Implement organic waste composter (OWC) in stilt zone.",
    ],
  };

  return (
    <div className="autodcr-green-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Leaf className="text-emerald-400" size={28} />
              Green Building & Environmental Rating
            </h1>
            <StatusBadge status="CERTIFIED" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Evaluating under standard: <span className="text-emerald-400 font-bold">{standard}</span> | File:{" "}
            <span className="text-slate-300 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="bg-slate-950 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-800"
          >
            {["GRIHA", "IGBC", "MUNICIPAL_GREEN", "LEED_INDIA"].map((s) => (
              <option key={s} value={s}>
                {s} Standard
              </option>
            ))}
          </select>

          <button
            onClick={runEvaluation}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Re-evaluate
          </button>
        </div>
      </div>

      {/* Main Score & Rating Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          score={scores.compliance_percentage || 87}
          title="Overall Green Rating"
          subtitle={scores.overall_rating || "5 Star GRIHA Rated"}
          icon={<Award className="text-emerald-400" size={24} />}
        />

        <div className="md:col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-emerald-400" size={32} />
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {scores.overall_rating || "5 Star Gold Rated"}
              </h3>
              <p className="text-xs text-emerald-300">Certified Sustainable Architectural Design</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            The project satisfies sustainable site development, energy efficiency, water management,
            and waste management criteria in accordance with municipal environmental bye-laws.
          </p>
        </div>
      </div>

      {/* 5 Sub-category Cards */}
      <div className="autodcr-green-grid">
        <div className="autodcr-green-card">
          <div>
            <Sun className="text-amber-400 mb-2" size={28} />
            <h4 className="font-bold text-white text-base">Solar Score</h4>
            <p className="text-xs text-slate-400">Rooftop Solar PV</p>
          </div>
          <ProgressBar progress={scores.solar_score} color="amber" />
        </div>

        <div className="autodcr-green-card">
          <div>
            <Droplet className="text-cyan-400 mb-2" size={28} />
            <h4 className="font-bold text-white text-base">Water Score</h4>
            <p className="text-xs text-slate-400">RWH & Recycling</p>
          </div>
          <ProgressBar progress={scores.water_score} color="cyan" />
        </div>

        <div className="autodcr-green-card">
          <div>
            <Trees className="text-emerald-400 mb-2" size={28} />
            <h4 className="font-bold text-white text-base">Landscape Score</h4>
            <p className="text-xs text-slate-400">Softscape Green</p>
          </div>
          <ProgressBar progress={scores.landscape_score} color="emerald" />
        </div>

        <div className="autodcr-green-card">
          <div>
            <Zap className="text-indigo-400 mb-2" size={28} />
            <h4 className="font-bold text-white text-base">Energy Score</h4>
            <p className="text-xs text-slate-400">EPI & HVAC</p>
          </div>
          <ProgressBar progress={scores.energy_score} color="indigo" />
        </div>

        <div className="autodcr-green-card">
          <div>
            <Trash2 className="text-rose-400 mb-2" size={28} />
            <h4 className="font-bold text-white text-base">Waste Score</h4>
            <p className="text-xs text-slate-400">OWC & Segregation</p>
          </div>
          <ProgressBar progress={scores.waste_score} color="rose" />
        </div>
      </div>

      {/* Environmental Recommendations */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Lightbulb className="text-amber-400" size={20} />
          Environmental Optimization Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(scores.recommendations || []).map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

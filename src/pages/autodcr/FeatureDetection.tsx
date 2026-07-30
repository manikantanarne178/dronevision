import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ScanSearch,
  CheckCircle2,
  AlertCircle,
  Square,
  Building,
  Navigation,
  Car,
  Flame,
  Sun,
  Droplet,
  Trees,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { DetectResponse } from "../../types/autodcr";
import ProgressBar from "../../components/common/ProgressBar";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./FeatureDetection.css";

const FEATURE_ITEMS = [
  { key: "plot", name: "Detected Plot", icon: Square, desc: "Plot boundary & coordinates" },
  { key: "building", name: "Detected Building", icon: Building, desc: "Building footprint & setbacks" },
  { key: "road", name: "Detected Roads", icon: Navigation, desc: "Frontage road width & access" },
  { key: "parking", name: "Parking Area", icon: Car, desc: "Stilt & open parking slots" },
  { key: "lift", name: "Lift / Elevator", icon: Layers, desc: "Passenger & service lifts" },
  { key: "staircase", name: "Fire Staircase", icon: Flame, desc: "Fire escape & main stairwell" },
  { key: "ramp", name: "Ramp Slope", icon: Navigation, desc: "Vehicular & handicap ramp" },
  { key: "terrace", name: "Terrace Floor", icon: Building, desc: "Refuge area & parapet" },
  { key: "basement", name: "Basement Floor", icon: Square, desc: "Single/multi level basement" },
  { key: "balcony", name: "Balcony / Projection", icon: Building, desc: "Cantilever balcony area" },
  { key: "solar", name: "Solar Panel Area", icon: Sun, desc: "Rooftop solar installation" },
  { key: "stp", name: "Sewage Treatment (STP)", icon: Droplet, desc: "STP plant area" },
  { key: "rwh", name: "Rain Water Harvesting", icon: Droplet, desc: "RWH pit & recharge well" },
  { key: "landscape", name: "Landscape / Open Green", icon: Trees, desc: "Softscape & green area" },
];

export default function FeatureDetection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";

  const [detectResult, setDetectResult] = useState<DetectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runDetection();
  }, [fileIdParam]);

  const runDetection = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.detectFeatures(fileIdParam);
      setDetectResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Feature detection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCalculate = () => {
    navigate(`/autodcr/calculate?file_id=${encodeURIComponent(fileIdParam)}`);
  };

  if (loading) {
    return (
      <div className="autodcr-detect-container">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScanSearch className="text-cyan-400 animate-spin" size={24} />
            Running Automatic Spatial Detection Engine...
          </h2>
          <p className="text-sm text-slate-400">
            Analyzing 14 key municipal architectural features & confidence scores...
          </p>
        </div>
        <SkeletonLoader type="card" count={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runDetection} />;
  }

  const detectionMap = detectResult?.detection_results || {};

  return (
    <div className="autodcr-detect-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={28} />
              Spatial Feature Detection Engine
            </h1>
            <StatusBadge status="DETECTED" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            File ID: <span className="text-cyan-400 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runDetection}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Re-detect
          </button>
          <button
            onClick={handleProceedToCalculate}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Proceed to Area Calculations <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="autodcr-detect-grid">
        {FEATURE_ITEMS.map((item) => {
          const Icon = item.icon;
          const rawData = detectionMap[item.key] || {};
          const isDetected = rawData.detected !== false;
          const confidence = typeof rawData.confidence === "number" ? rawData.confidence : (isDetected ? 0.95 : 0.0);
          const confidencePct = Math.round(confidence * 100);

          return (
            <div key={item.key} className="autodcr-detect-card">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Icon className="text-cyan-400" size={20} />
                  </div>
                  {isDetected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 size={14} /> Detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                      <AlertCircle size={14} /> Not Detected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <ProgressBar
                  progress={confidencePct}
                  label="Detection Confidence"
                  color={confidencePct > 80 ? "emerald" : confidencePct > 50 ? "amber" : "rose"}
                />
                {rawData.details && (
                  <p className="text-xs text-slate-400 font-mono truncate">{rawData.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

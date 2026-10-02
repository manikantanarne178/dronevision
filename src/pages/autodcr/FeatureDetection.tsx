import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Layers,
  MapPin,
  Building2,
  Car,
  TreePine,
  Sun,
  Droplets,
  ArrowRight,
  RefreshCw,
  ScanSearch,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { DetectResponse } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import "./FeatureDetection.css";

export default function FeatureDetection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;

  const [detectResult, setDetectResult] = useState<DetectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runDetection = useCallback(async () => {
    if (!fileIdParam) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.detectFeatures(fileIdParam);
      setDetectResult(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Feature detection failed";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam]);

  useEffect(() => {
    runDetection();
  }, [runDetection]);

  const handleProceedToCalculate = () => {
    navigate(`/autodcr/calculate?file_id=${encodeURIComponent(fileIdParam)}`);
  };

  if (!fileIdParam) {
    return (
      <div className="autodcr-detect-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Automatic Spatial Feature Detection"
          subtitle="Choose any registered architectural drawing to identify plot bounds, building footprints, and room allocations."
          onSelectProject={(id) => navigate(`/autodcr/detect?file_id=${encodeURIComponent(id)}`)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-detect-container space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ScanSearch className="text-cyan-600 animate-spin" size={20} />
            Running Automatic Spatial Detection Engine...
          </h2>
          <p className="text-xs text-slate-500">
            Analyzing municipal architectural features & confidence scores...
          </p>
        </div>
        <SkeletonLoader type="card" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-detect-container space-y-6">
        <ErrorState
          message={error}
          onRetry={runDetection}
          actionText="Select Another Project"
          onAction={() => navigate("/autodcr/projects")}
        />
      </div>
    );
  }

  const detectionMap = detectResult?.detection_results || {};
  const featureKeys = Object.keys(detectionMap);

  const FEATURE_ICONS: Record<string, any> = {
    plot: MapPin,
    building: Building2,
    road: Layers,
    parking: Car,
    landscape: TreePine,
    solar: Sun,
    rwh: Droplets,
  };

  return (
    <div className="autodcr-detect-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) => navigate(`/autodcr/detect?file_id=${encodeURIComponent(id)}`)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-cyan-600" size={22} />
              Automatic Spatial Feature Detection
            </h1>
            <StatusBadge status="DETECTED" label={`${featureKeys.length} Features`} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
            Target Drawing: <span className="text-cyan-700 font-mono font-semibold flex items-center gap-1"><FileCode className="w-3.5 h-3.5" />{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={runDetection}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Re-run Detection"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleProceedToCalculate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            Calculate Spatial Metrics <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Detected Feature Cards Grid */}
      {featureKeys.length === 0 ? (
        <EmptyState
          title="No Features Detected"
          description="The detection engine did not find recognizable CAD layers or polyline boundaries in this drawing."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featureKeys.map((key) => {
            const feat = detectionMap[key];
            const Icon = FEATURE_ICONS[key] || Layers;
            const isDetected = feat && feat.detected !== false;
            const confidence = feat?.confidence !== undefined ? Math.round(feat.confidence * 100) : 95;

            return (
              <div
                key={key}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-cyan-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                    <Icon size={20} />
                  </div>
                  <StatusBadge status={isDetected ? "DETECTED" : "NOT_FOUND"} size="sm" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    {key.replace("_", " ")}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isDetected
                      ? `Layer: ${feat?.layer || key.toUpperCase()}`
                      : "Not identified in drawing CAD layers"}
                  </p>
                </div>

                {isDetected && (
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-bold text-cyan-700">{confidence}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

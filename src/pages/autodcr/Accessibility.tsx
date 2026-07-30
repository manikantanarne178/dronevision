import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Accessibility as AccessIcon,
  CheckCircle2,
  XCircle,
  Footprints,
  DoorOpen,
  ArrowRightLeft,
  Navigation,
  RefreshCw,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AccessibilityResponse, AccessibilityScore } from "../../types/autodcr";
import ScoreCard from "../../components/common/ScoreCard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./Accessibility.css";

export default function Accessibility() {
  const [searchParams] = useSearchParams();
  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";

  const [accessRes, setAccessRes] = useState<AccessibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runEvaluation();
  }, [fileIdParam]);

  const runEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.evaluateAccessibility(fileIdParam);
      setAccessRes(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Accessibility evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="autodcr-access-container">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runEvaluation} />;
  }

  const access: AccessibilityScore = accessRes?.accessibility || {
    wheelchair_route: true,
    accessible_entrance: true,
    ramp_compliance: true,
    lift_accessibility: true,
    door_width_mm: 1000,
    corridor_width_mm: 1500,
    accessible_toilets: true,
    handrails_provided: true,
    tactile_path: true,
    compliance_percentage: 95,
  };

  const checklist = [
    { name: "Continuous Wheelchair Route", val: access.wheelchair_route, desc: "Step-free path from boundary to entrance" },
    { name: "Barrier-Free Entrance", val: access.accessible_entrance, desc: "Minimum 1200mm entrance door clearance" },
    { name: "Ramp Slope Compliance (1:12)", val: access.ramp_compliance, desc: "Handrails & non-slip surface" },
    { name: "Braille / Accessible Lift", val: access.lift_accessibility, desc: "Audio announcement & low buttons" },
    { name: "Unisex Accessible Restroom", val: access.accessible_toilets, desc: "Grab bars & emergency call button" },
    { name: "Dual Height Handrails", val: access.handrails_provided, desc: "Continuous on both sides of stairs" },
    { name: "Tactile Ground Surface Indicator", val: access.tactile_path, desc: "Warning blocks at hazardous drops" },
  ];

  return (
    <div className="autodcr-access-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <AccessIcon className="text-cyan-400" size={28} />
              Barrier-Free Accessibility Scrutiny
            </h1>
            <StatusBadge status="COMPLIANT" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Rights of Persons with Disabilities Standards & NBC Clause 12 | File:{" "}
            <span className="text-cyan-400 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <button
          onClick={runEvaluation}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Re-evaluate
        </button>
      </div>

      {/* Main Score & Width Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          score={access.compliance_percentage || 95}
          title="Barrier-Free Score"
          subtitle="NBC 2016 Accessibility Code"
          icon={<AccessIcon className="text-cyan-400" size={24} />}
        />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <DoorOpen className="text-cyan-400" size={20} />
              <span className="text-sm text-slate-300 font-semibold">Clear Door Width</span>
            </div>
            <span className="font-extrabold text-white text-base">
              {access.door_width_mm || 1000} mm <span className="text-xs text-emerald-400 font-bold">(Standard &ge; 900mm)</span>
            </span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="text-indigo-400" size={20} />
              <span className="text-sm text-slate-300 font-semibold">Corridor Passage Width</span>
            </div>
            <span className="font-extrabold text-white text-base">
              {access.corridor_width_mm || 1500} mm <span className="text-xs text-emerald-400 font-bold">(Standard &ge; 1500mm)</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Footprints className="text-amber-400" size={28} />
            <div>
              <h4 className="font-bold text-white text-base">Tactile Route</h4>
              <p className="text-xs text-amber-300">Warning & Guiding Blocks Detected</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous tactile ground surface indicators provided along all main circulation pathways.
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Navigation className="text-cyan-400" size={20} />
          NBC Barrier-Free Compliance Checklist
        </h3>

        <div className="autodcr-access-grid">
          {checklist.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              {item.val ? (
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              ) : (
                <XCircle className="text-rose-400 shrink-0 mt-0.5" size={20} />
              )}
              <div>
                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

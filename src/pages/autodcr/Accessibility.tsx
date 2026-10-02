import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Accessibility as AccessIcon,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { AccessibilityResponse, AccessibilityScore } from "../../types/autodcr";
import ScoreCard from "../../components/common/ScoreCard";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import "./Accessibility.css";

export default function Accessibility() {
  const [searchParams] = useSearchParams();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;

  const [accessRes, setAccessRes] = useState<AccessibilityResponse | null>(null);
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

      const res = await AutoDCRService.evaluateAccessibility(fileIdParam);
      setAccessRes(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Accessibility evaluation failed";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam]);

  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  if (!fileIdParam) {
    return (
      <div className="autodcr-access-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Accessibility & Barrier-Free Audit"
          subtitle="Choose any registered municipal drawing project to evaluate NBC Part 3 accessibility and barrier-free parameters."
          onSelectProject={(id) => window.location.assign(`/autodcr/accessibility?file_id=${encodeURIComponent(id)}`)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-access-container space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-access-container space-y-6">
        <ErrorState
          message={error}
          onRetry={runEvaluation}
          actionText="Select Another Project"
          onAction={() => window.location.assign("/autodcr/projects")}
        />
      </div>
    );
  }

  const access: AccessibilityScore = accessRes?.accessibility || {
    wheelchair_route: false,
    accessible_entrance: false,
    ramp_compliance: false,
    lift_accessibility: false,
    door_width_mm: 0,
    corridor_width_mm: 0,
    accessible_toilets: false,
    handrails_provided: false,
    tactile_path: false,
    compliance_percentage: 0,
    overall_accessibility_status: "PENDING",
  };

  const dynamicChecks =
    access.check_details && access.check_details.length > 0
      ? access.check_details.map((c) => ({
          name: c.rule,
          val: c.status === "PASS",
          desc: `Required: ${c.required} | Measured: ${c.actual}`,
        }))
      : [
          { name: "Continuous Wheelchair Route", val: access.wheelchair_route !== false, desc: "Step-free path from boundary to entrance" },
          { name: "Barrier-Free Entrance", val: access.accessible_entrance !== false, desc: "Minimum 1200mm entrance door clearance" },
          { name: "Ramp Slope Compliance (1:12)", val: access.ramp_compliance !== false, desc: "Handrails & non-slip surface" },
          { name: "Braille / Accessible Lift", val: access.lift_accessibility !== false, desc: "Audio announcement & low buttons" },
          { name: "Unisex Accessible Restroom", val: access.accessible_toilets !== false, desc: "Grab bars & emergency call button" },
          { name: "Dual Height Handrails", val: access.handrails_provided !== false, desc: "Continuous on both sides of stairs" },
          { name: "Tactile Ground Surface Indicator", val: access.tactile_path !== false, desc: "Warning blocks at hazardous drops" },
        ];

  const overallScore =
    access.compliance_percentage ||
    access.accessibility_score_percentage ||
    0;
  const overallStatus =
    access.overall_accessibility_status ||
    (overallScore >= 80 ? "COMPLIANT" : "NON_COMPLIANT");

  return (
    <div className="autodcr-access-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) => window.location.assign(`/autodcr/accessibility?file_id=${encodeURIComponent(id)}`)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AccessIcon className="text-cyan-600" size={22} />
              Barrier-Free Accessibility Scrutiny
            </h1>
            <StatusBadge status={overallStatus} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
            Standards: <b className="text-slate-700">NBC 2016 / Harmonized Guidelines</b> | File:{" "}
            <span className="text-slate-700 font-mono font-semibold flex items-center gap-1"><FileCode className="w-3.5 h-3.5 text-slate-400" />{fileIdParam}</span>
          </p>
        </div>

        <button
          onClick={runEvaluation}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer self-start sm:self-auto"
          title="Re-run Accessibility Check"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Accessibility Compliance"
          score={overallScore}
          subtitle="Persons with Disabilities Act Standard"
        />

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Entrance Door Clearance
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {access.door_width_mm || 0} <span className="text-xs font-normal text-slate-400">mm</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Min 1000mm req.</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Corridor Passage Width
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {access.corridor_width_mm || 0} <span className="text-xs font-normal text-slate-400">mm</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Min 1500mm req.</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accessible Restrooms
            </p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {access.accessible_toilets ? "Provided" : "Missing"}
            </h3>
            <span className="text-[11px] text-slate-400">Ground Floor Mandatory</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Universal Access Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-2 border-b border-slate-100">
          Mandatory Accessibility Compliance Checklist
        </h3>

        <div className="divide-y divide-slate-100">
          {dynamicChecks.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
              <div>
                {item.val ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 size={13} /> Compliant
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                    <XCircle size={13} /> Non-Compliant
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

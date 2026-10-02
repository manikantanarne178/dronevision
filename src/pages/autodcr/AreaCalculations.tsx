import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calculator,
  Square,
  Building2,
  Ruler,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { CalculateResponse } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import "./AreaCalculations.css";

export default function AreaCalculations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;
  const initialFloor = Number(searchParams.get("floor_count")) || 1;

  const [floorCount, setFloorCount] = useState<number>(initialFloor);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runCalculations = useCallback(async () => {
    if (!fileIdParam) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.calculateMetrics(fileIdParam, floorCount);
      setCalcResult(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Calculation failed";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam, floorCount]);

  useEffect(() => {
    runCalculations();
  }, [runCalculations]);

  const handleProceedToValidate = () => {
    navigate(
      `/autodcr/validate?file_id=${encodeURIComponent(
        fileIdParam
      )}&floor_count=${floorCount}`
    );
  };

  if (!fileIdParam) {
    return (
      <div className="autodcr-calc-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Area & FSI Calculations"
          subtitle="Choose any registered municipal drawing project to compute plot coverage, built-up areas, and setbacks."
          onSelectProject={(id) => navigate(`/autodcr/calculate?file_id=${encodeURIComponent(id)}`)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-calc-container space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-calc-container space-y-6">
        <ErrorState
          message={error}
          onRetry={runCalculations}
          actionText="Select Another Project"
          onAction={() => navigate("/autodcr/projects")}
        />
      </div>
    );
  }

  const areas = calcResult?.areas || {
    plot_area: 0,
    ground_coverage_area: 0,
    built_up_area: 0,
    fsi_achieved: 0,
    fsi_permissible: 0,
    far_achieved: 0,
    open_area: 0,
    landscape_area: 0,
  };

  const heights = calcResult?.heights || {
    total_height: 0,
    floor_height: 0,
    floor_count: floorCount,
    stilt_height: 0,
    parapet_height: 0,
  };

  const parking = calcResult?.parking || {
    required_slots: 0,
    provided_slots: 0,
    visitor_slots: 0,
    handicapped_slots: 0,
    ramp_slope_ratio: 0,
    status: "PENDING",
  };

  return (
    <div className="autodcr-calc-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) => navigate(`/autodcr/calculate?file_id=${encodeURIComponent(id)}`)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="text-cyan-600" size={22} />
              Area, Height & Parking Calculations
            </h1>
            <StatusBadge status="CALCULATED" />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
            File Reference: <span className="text-cyan-700 font-mono font-semibold flex items-center gap-1"><FileCode className="w-3.5 h-3.5" />{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-700">Floors:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={floorCount}
              onChange={(e) => setFloorCount(Math.max(1, Number(e.target.value)))}
              className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-center text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={runCalculations}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Recalculate Metrics"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={handleProceedToValidate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            Proceed to Bylaws Scrutiny <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Plot Area
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {Number(areas.plot_area || 0).toFixed(2)}{" "}
              <span className="text-xs font-normal text-slate-400">sq.m</span>
            </h3>
            <span className="text-[11px] text-cyan-600 font-semibold">Gross Cadastral Area</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Square size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Built-up Area (BUA)
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {Number(areas.built_up_area || 0).toFixed(2)}{" "}
              <span className="text-xs font-normal text-slate-400">sq.m</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Total Cumulative Area</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Achieved FSI / FAR
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {Number(areas.fsi_achieved || areas.far_achieved || 0).toFixed(2)}
            </h3>
            <span className="text-[11px] text-indigo-600 font-semibold">
              Permissible: {Number(areas.fsi_permissible || 1.5).toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Building Height
            </p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
              {Number(heights.total_height || 0).toFixed(1)}{" "}
              <span className="text-xs font-normal text-slate-400">m</span>
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">
              {heights.floor_count} Floors Verified
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Ruler size={24} />
          </div>
        </div>
      </div>

      {/* Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-2 border-b border-slate-100">
            Spatial Area Breakdown
          </h3>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              { label: "Gross Site / Plot Area", val: `${Number(areas.plot_area || 0).toFixed(2)} sq.m` },
              { label: "Ground Coverage Footprint", val: `${Number(areas.ground_coverage_area || 0).toFixed(2)} sq.m` },
              { label: "Cumulative Built-Up Area (BUA)", val: `${Number(areas.built_up_area || 0).toFixed(2)} sq.m` },
              { label: "Net Open Space Surrounding", val: `${Number(areas.open_area || 0).toFixed(2)} sq.m` },
              { label: "Softscape & Landscape Area", val: `${Number(areas.landscape_area || 0).toFixed(2)} sq.m` },
              { label: "Floor Space Index (FSI) Ratio", val: Number(areas.fsi_achieved || areas.far_achieved || 0).toFixed(3) },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                <span className="text-slate-600">{row.label}</span>
                <span className="font-mono font-bold text-slate-900">{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Height & Parking Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-2 border-b border-slate-100">
            Height & Parking Allocation
          </h3>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              { label: "Total Structure Height (AGL)", val: `${Number(heights.total_height || 0).toFixed(2)} m` },
              { label: "Average Floor-to-Floor Height", val: `${Number(heights.floor_height || 0).toFixed(2)} m` },
              { label: "Stilt / Ground Clearance", val: `${Number(heights.stilt_height || 0).toFixed(2)} m` },
              { label: "Required Parking Slots (NBC)", val: `${parking.required_slots || 0} ECS` },
              { label: "Provided Parking Slots", val: `${parking.provided_slots || 0} ECS` },
              { label: "Visitor & Accessible Slots", val: `${(parking.visitor_slots || 0) + (parking.handicapped_slots || 0)} ECS` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                <span className="text-slate-600">{row.label}</span>
                <span className="font-mono font-bold text-slate-900">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

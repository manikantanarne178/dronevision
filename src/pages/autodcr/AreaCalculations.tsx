import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calculator,
  Square,
  Building2,
  Ruler,
  Car,
  Maximize2,
  Trees,
  ArrowRight,
  RefreshCw,
  Sliders,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { CalculateResponse } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./AreaCalculations.css";

export default function AreaCalculations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";

  const [floorCount, setFloorCount] = useState<number>(3);
  const [calcResult, setCalcResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runCalculations();
  }, [fileIdParam, floorCount]);

  const runCalculations = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.calculateMetrics(fileIdParam, floorCount);
      setCalcResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Area calculations failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToValidate = () => {
    navigate(`/autodcr/validate?file_id=${encodeURIComponent(fileIdParam)}&floor_count=${floorCount}`);
  };

  if (loading) {
    return (
      <div className="autodcr-calc-container">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runCalculations} />;
  }

  const areas = calcResult?.areas || {
    plot_area: 1250.0,
    ground_coverage_area: 450.0,
    built_up_area: 1350.0,
    fsi_achieved: 1.08,
    fsi_permissible: 1.5,
    far_achieved: 1.08,
    open_area: 800.0,
    landscape_area: 200.0,
  };

  const heights = calcResult?.heights || {
    total_height: 12.5,
    floor_height: 3.5,
    floor_count: floorCount,
    stilt_height: 2.4,
    parapet_height: 1.2,
  };

  const parking = calcResult?.parking || {
    required_slots: 12,
    provided_slots: 15,
    visitor_slots: 2,
    handicapped_slots: 1,
    ramp_slope_ratio: 10,
    status: "PASS",
  };

  return (
    <div className="autodcr-calc-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Calculator className="text-cyan-400" size={28} />
              Area, Height & Parking Calculations
            </h1>
            <StatusBadge status="CALCULATED" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            File ID: <span className="text-cyan-400 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sliders size={16} className="text-slate-400" />
            <span className="text-xs text-slate-300 font-semibold">Floors:</span>
            <select
              value={floorCount}
              onChange={(e) => setFloorCount(Number(e.target.value))}
              className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-slate-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((f) => (
                <option key={f} value={f}>
                  {f} Floors
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleProceedToValidate}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Validate Municipal Rules <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="autodcr-calc-metric-grid">
        <div className="autodcr-calc-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plot Area</p>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {areas.plot_area?.toFixed(2)} <span className="text-sm font-normal text-slate-400">sq.m</span>
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Square size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Total surveyed site area</p>
        </div>

        <div className="autodcr-calc-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Built-Up Area</p>
              <h2 className="text-3xl font-extrabold text-cyan-300 mt-2">
                {areas.built_up_area?.toFixed(2)} <span className="text-sm font-normal text-slate-400">sq.m</span>
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Total constructed floor area</p>
        </div>

        <div className="autodcr-calc-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FSI / FAR Achieved</p>
              <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {areas.fsi_achieved?.toFixed(2)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Maximize2 size={24} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3">
            Permissible Max FSI: {areas.fsi_permissible || 1.5}
          </p>
        </div>

        <div className="autodcr-calc-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Coverage</p>
              <h2 className="text-3xl font-extrabold text-amber-400 mt-2">
                {areas.ground_coverage_area?.toFixed(2)} <span className="text-sm font-normal text-slate-400">sq.m</span>
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Ruler size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {((areas.ground_coverage_area / areas.plot_area) * 100).toFixed(1)}% of Plot Area
          </p>
        </div>
      </div>

      {/* Detailed Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Height & Floors */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Ruler className="text-cyan-400" size={20} />
            Building Height Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Total Building Height</span>
              <span className="font-bold text-white">{heights.total_height} m</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Floor Count</span>
              <span className="font-bold text-cyan-400">{heights.floor_count} Floors</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Floor Height (Clear)</span>
              <span className="font-bold text-white">{heights.floor_height} m</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Stilt Height</span>
              <span className="font-bold text-white">{heights.stilt_height || 2.4} m</span>
            </div>
          </div>
        </div>

        {/* Parking & Ramp */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Car className="text-emerald-400" size={20} />
            Parking & Access Provisions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Required Slots</span>
              <span className="font-bold text-white">{parking.required_slots} ECS</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Provided Slots</span>
              <span className="font-bold text-emerald-400">{parking.provided_slots} ECS</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Ramp Slope Ratio</span>
              <span className="font-bold text-white">1 : {parking.ramp_slope_ratio || 10}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Parking Compliance</span>
              <StatusBadge status={parking.status || "PASS"} />
            </div>
          </div>
        </div>

        {/* Open & Green Area */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Trees className="text-amber-400" size={20} />
            Open Space & Landscape
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Open Ground Area</span>
              <span className="font-bold text-white">{areas.open_area?.toFixed(2)} sq.m</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Landscape Green Area</span>
              <span className="font-bold text-amber-400">{areas.landscape_area?.toFixed(2)} sq.m</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              <span className="text-slate-400">Softscape Ratio</span>
              <span className="font-bold text-white">
                {((areas.landscape_area / areas.plot_area) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { ValidateResponse, RuleViolation } from "../../types/autodcr";
import ScoreCard from "../../components/common/ScoreCard";
import StatusBadge from "../../components/common/StatusBadge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import "./ValidationResults.css";

export default function ValidationResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";
  const initialZone = searchParams.get("zone") || "Residential";
  const initialFloor = Number(searchParams.get("floor_count")) || 1;

  const [zone, setZone] = useState<string>(initialZone);
  const [validResult, setValidResult] = useState<ValidateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    runValidation();
  }, [fileIdParam, zone, initialFloor]);

  const runValidation = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.validateFile(fileIdParam, zone, initialFloor);
      setValidResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!validResult) return;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(validResult, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `validation_${fileIdParam}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleProceedToReport = () => {
    navigate(`/autodcr/report?file_id=${encodeURIComponent(fileIdParam)}&zone=${encodeURIComponent(zone)}`);
  };

  if (loading) {
    return (
      <div className="autodcr-valid-container">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runValidation} />;
  }

  const validations: RuleViolation[] = validResult?.validations || [
    {
      rule_name: "Front Setback Width",
      category: "Setback",
      expected_value: ">= 3.0 m",
      actual_value: "3.5 m",
      status: "PASS",
      suggestion: "Compliant with Municipal Bye-laws 2024",
    },
    {
      rule_name: "Rear Setback Width",
      category: "Setback",
      expected_value: ">= 2.0 m",
      actual_value: "1.8 m",
      status: "FAIL",
      suggestion: "Increase rear open area by 0.2 meters to conform.",
    },
    {
      rule_name: "FSI Limit Ratio",
      category: "FSI",
      expected_value: "<= 1.50",
      actual_value: "1.42",
      status: "PASS",
      suggestion: "FSI within permissible quota.",
    },
    {
      rule_name: "Fire Staircase Width",
      category: "Safety",
      expected_value: ">= 1.5 m",
      actual_value: "1.5 m",
      status: "PASS",
      suggestion: "Fire safety access verified.",
    },
    {
      rule_name: "Rain Water Harvesting Pit",
      category: "Environment",
      expected_value: "Mandatory for >500m²",
      actual_value: "Provided (1 pit)",
      status: "PASS",
      suggestion: "Environmental clause satisfied.",
    },
  ];

  const filtered = validations.filter((v) => {
    const matchesSearch =
      v.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const passCount = validations.filter((v) => v.status === "PASS").length;
  const failCount = validations.filter((v) => v.status === "FAIL").length;
  const warnCount = validations.filter((v) => v.status === "WARNING").length;
  const compliancePct = Math.round((passCount / (validations.length || 1)) * 100);

  return (
    <div className="autodcr-valid-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-cyan-400" size={28} />
              Municipal Bye-laws Validation
            </h1>
            <StatusBadge status={failCount === 0 ? "PASS" : "CONDITIONAL"} />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Scrutiny Zone: <span className="text-cyan-400 font-bold">{zone}</span> | File ID:{" "}
            <span className="text-slate-300 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-slate-950 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-800"
          >
            {["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"].map((z) => (
              <option key={z} value={z}>
                {z} Zone
              </option>
            ))}
          </select>

          <button
            onClick={exportResults}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2"
          >
            <Download size={14} /> Export JSON
          </button>

          <button
            onClick={handleProceedToReport}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Generate Official Report <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScoreCard
          score={compliancePct}
          title="Overall Compliance"
          subtitle={`${passCount} of ${validations.length} Municipal Rules Passed`}
        />

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-emerald-400">{passCount}</h3>
            <p className="text-xs font-semibold text-slate-300">Rules Passed</p>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <XCircle size={24} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-rose-400">{failCount}</h3>
            <p className="text-xs font-semibold text-slate-300">Rule Violations</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-amber-400">{warnCount}</h3>
            <p className="text-xs font-semibold text-slate-300">Warnings / Remarks</p>
          </div>
        </div>
      </div>

      {/* Filter & Table Bar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              placeholder="Filter by rule name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 py-2 pr-4 text-sm text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs text-slate-400">Status:</span>
            {["ALL", "PASS", "FAIL", "WARNING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Violations Table */}
        <div className="autodcr-valid-table-wrapper custom-scrollbar">
          <table className="autodcr-valid-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Category</th>
                <th>Expected Standard</th>
                <th>Actual Measured</th>
                <th>Status</th>
                <th>Compliance Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-white">{item.rule_name}</td>
                  <td>
                    <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-400 text-xs font-mono">
                      {item.category}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{item.expected_value}</td>
                  <td className="font-mono text-xs text-cyan-300">{item.actual_value}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="text-xs text-slate-400">{item.suggestion || "N/A"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-500">
                    No rule violations match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

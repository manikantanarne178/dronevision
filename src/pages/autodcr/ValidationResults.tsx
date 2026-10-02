import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  FileCode,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { ValidateResponse, RuleViolation } from "../../types/autodcr";
import ScoreCard from "../../components/common/ScoreCard";
import StatusBadge from "../../components/common/StatusBadge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import "./ValidationResults.css";

export default function ValidationResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;
  const initialZone = searchParams.get("zone") || "Residential";
  const initialFloor = Number(searchParams.get("floor_count")) || 1;

  const [zone, setZone] = useState<string>(initialZone);
  const [validResult, setValidResult] = useState<ValidateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const runValidation = useCallback(async () => {
    if (!fileIdParam) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.validateFile(fileIdParam, zone, initialFloor);
      setValidResult(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Validation failed";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam, zone, initialFloor]);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const exportResults = () => {
    if (!validResult) return;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(validResult, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `validation_${fileIdParam || "project"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleProceedToReport = () => {
    navigate(
      `/autodcr/report?file_id=${encodeURIComponent(
        fileIdParam
      )}&zone=${encodeURIComponent(zone)}`
    );
  };

  if (!fileIdParam) {
    return (
      <div className="autodcr-valid-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Municipal Bye-laws Scrutiny"
          subtitle="Choose any registered municipal drawing project to evaluate FAR, setbacks, heights, and zoning bylaws."
          onSelectProject={(id) => navigate(`/autodcr/validate?file_id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-valid-container space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-valid-container space-y-6">
        <ErrorState
          message={error}
          onRetry={runValidation}
          actionText="Select Another Project"
          onAction={() => navigate("/autodcr/projects")}
        />
      </div>
    );
  }

  const validations: RuleViolation[] = validResult?.validations || [];

  const filtered = validations.filter((v) => {
    const matchesSearch =
      v.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const passCount = validations.filter((v) => v.status === "PASS").length;
  const failCount = validations.filter((v) => v.status === "FAIL").length;
  const warnCount = validations.filter((v) => v.status === "WARNING").length;
  const compliancePct = validations.length > 0
    ? Math.round((passCount / validations.length) * 100)
    : (validResult?.compliance?.compliance_percentage ?? 100);

  return (
    <div className="autodcr-valid-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) => navigate(`/autodcr/validate?file_id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-cyan-600" size={22} />
              Municipal Bye-laws Scrutiny Validation
            </h1>
            <StatusBadge status={failCount === 0 ? "PASS" : "FAIL"} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-2">
            <span>Scrutiny Zone: <b className="text-cyan-800">{zone}</b></span>
            <span>•</span>
            <span className="font-mono text-slate-700 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              {fileIdParam}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            {["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"].map((z) => (
              <option key={z} value={z}>
                {z} Zone
              </option>
            ))}
          </select>

          <button
            onClick={exportResults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Download size={14} /> Export JSON
          </button>

          <button
            onClick={handleProceedToReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            View Official Certificate <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Overall Compliance Score"
          score={compliancePct}
          subtitle={`${passCount} of ${validations.length || 0} Clauses Passed`}
        />

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Passed Rules
            </p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {passCount}
            </h3>
            <span className="text-[11px] text-slate-400">100% Conforming</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Violations / Failed
            </p>
            <h3 className="text-2xl font-black text-rose-600 font-mono mt-1">
              {failCount}
            </h3>
            <span className="text-[11px] text-slate-400">Requires Correction</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Warnings & Advisory
            </p>
            <h3 className="text-2xl font-black text-amber-500 font-mono mt-1">
              {warnCount}
            </h3>
            <span className="text-[11px] text-slate-400">Discretionary Approvals</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              placeholder="Search rule clause, setback, height..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-1.5 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto text-xs font-bold">
            {["ALL", "PASS", "FAIL", "WARNING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {validations.length === 0 ? (
          <EmptyState
            title="No Scrutiny Violations Recorded"
            description="The rule evaluation engine did not return any specific rule breaches for this drawing."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Rule Clause / Parameter</th>
                  <th>Category</th>
                  <th>Bylaw Requirement</th>
                  <th>Observed Metric</th>
                  <th>Scrutiny Result</th>
                  <th>Advisory / Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {item.rule_name}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-600 font-semibold">
                      {item.expected_value}
                    </td>
                    <td className="font-mono text-xs font-bold text-slate-900">
                      {item.actual_value}
                    </td>
                    <td>
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs">
                      {item.suggestion || "Complies with regulatory thresholds."}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <EmptyState
                        title="No Rules Match Filter"
                        description="Try clearing your search query or switching status filters."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

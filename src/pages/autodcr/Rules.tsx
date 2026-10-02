import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  RefreshCw,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { RuleItem } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import "./Rules.css";

const OCCUPANCIES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed Use",
  "High Rise",
];

const normalizeRules = (data: any, currentOccupancy: string): RuleItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data;
  }
  if (data.rules) {
    if (Array.isArray(data.rules)) {
      return data.rules;
    }
    if (typeof data.rules === "object") {
      return Object.entries(data.rules).map(([key, val]: [string, any]) => ({
        id: key,
        rule_name: val.name || val.rule_name || key.replace(/_/g, " ").toUpperCase(),
        category: val.category || data.zone || currentOccupancy,
        min_value: val.min ?? val.min_value ?? val.min_count ?? val.min_area,
        max_value: val.max ?? val.max_value,
        unit: val.unit || (val.min_area ? "sq.m" : val.min_count ? "nos" : (val.min || val.max ? "m" : "")),
        description: val.suggestion || val.description || val.name || "",
        clause_reference: val.reference_code || val.clause_reference || "NBC 2016 / GDCR",
        is_mandatory: val.severity === "CRITICAL" || val.severity === "HIGH" || !!val.is_mandatory,
      }));
    }
  }
  return [];
};

export default function Rules() {
  const [occupancy, setOccupancy] = useState<string>("Residential");
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.getRules(occupancy);
      const parsed = normalizeRules(res, occupancy);
      setRules(parsed);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load municipal rules from server"
      );
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [occupancy]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="autodcr-rules-container space-y-6">
        <SkeletonLoader type="card" count={3} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRules} />;
  }

  const filtered = rules.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.rule_name || "").toLowerCase().includes(term) ||
      (r.description || "").toLowerCase().includes(term) ||
      (r.clause_reference || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="autodcr-rules-container space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="text-cyan-600" size={22} />
              Configurable Municipal Rule Engine
            </h1>
            <StatusBadge status="ACTIVE" label={`${rules.length} Rules`} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Statutory Development Control Regulations & National Building Code Clauses
          </p>
        </div>

        <button
          onClick={fetchRules}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Rules
        </button>
      </div>

      {/* Occupancy Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {OCCUPANCIES.map((occ) => (
          <button
            key={occ}
            onClick={() => setOccupancy(occ)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              occupancy === occ
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {occ} Bylaws
          </button>
        ))}
      </div>

      {/* Filter and Rule Accordion List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            placeholder="Search rules, clause reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-1.5 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 transition-colors"
          />
        </div>

        {rules.length === 0 ? (
          <EmptyState
            title="No Municipal Rules Configured"
            description={`No rules currently loaded for ${occupancy} occupancy.`}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((r, i) => {
              const ruleId = r.id || `rule-${i}`;
              const isExpanded = !!expandedIds[ruleId];
              return (
                <div
                  key={ruleId}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(ruleId)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                        <Shield size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {r.rule_name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {r.clause_reference || "NBC Standard Clause"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-cyan-800">
                          {r.min_value ? `>= ${r.min_value}` : ""}
                          {r.max_value ? `<= ${r.max_value}` : ""} {r.unit || ""}
                        </span>
                      </div>
                      <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-400">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 bg-white text-xs text-slate-600 space-y-2">
                      <p className="leading-relaxed">{r.description}</p>
                      <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500">
                        <span>Category: <b className="text-slate-700">{r.category || occupancy}</b></span>
                        {r.unit && <span>Units: <b className="text-slate-700">{r.unit}</b></span>}
                        {r.is_mandatory && <span className="text-rose-600 font-bold">Mandatory Statutory Condition</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && rules.length > 0 && (
              <EmptyState
                title="No Matching Rules"
                description="No rule criteria match your search term."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  FileCheck2,
  Building,
  RefreshCw,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { RuleItem } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./Rules.css";

const OCCUPANCIES = ["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"];

export default function Rules() {
  const [occupancy, setOccupancy] = useState<string>("Residential");
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRules();
  }, [occupancy]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.getRules(occupancy);
      setRules(res || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to load municipal rules");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const defaultRulesList: RuleItem[] = [
    {
      id: "r1",
      rule_name: "Front Setback Requirement",
      category: "Residential",
      min_value: "3.0",
      unit: "meters",
      description: "Minimum distance required between plot boundary road frontage and building envelope line.",
      clause_reference: "NBC Clause 4.2.1",
      is_mandatory: true,
    },
    {
      id: "r2",
      rule_name: "Permissible FSI / FAR",
      category: "Residential",
      max_value: "1.50",
      description: "Ratio of total built-up area to total plot area.",
      clause_reference: "Municipal Bye-laws 2024 Sec 8.1",
      is_mandatory: true,
    },
    {
      id: "r3",
      rule_name: "Ground Coverage Maximum",
      category: "Residential",
      max_value: "50",
      unit: "%",
      description: "Maximum percentage of plot area that can be covered by building ground floor footprint.",
      clause_reference: "NBC Clause 4.3.2",
      is_mandatory: true,
    },
    {
      id: "r4",
      rule_name: "Maximum Building Height",
      category: "Residential",
      max_value: "15.0",
      unit: "meters",
      description: "Maximum allowed building height excluding parapet wall and staircase room.",
      clause_reference: "Fire Safety Act Sec 12",
      is_mandatory: true,
    },
    {
      id: "r5",
      rule_name: "Minimum Parking Slots (ECS)",
      category: "Residential",
      min_value: "1 per 100 sq.m",
      description: "Equivalent Car Spaces required based on total carpet area.",
      clause_reference: "Traffic & Parking Bye-laws Sec 3",
      is_mandatory: true,
    },
  ];

  const activeList = rules.length > 0 ? rules : defaultRulesList;

  const filteredRules = activeList.filter((r) => {
    return (
      r.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clause_reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="autodcr-rules-container">
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRules} />;
  }

  return (
    <div className="autodcr-rules-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="text-cyan-400" size={28} />
              Municipal Development Rules & Bye-laws
            </h1>
            <StatusBadge status="ACTIVE" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Configurable Rule Set for Occupancy: <span className="text-cyan-400 font-bold">{occupancy}</span>
          </p>
        </div>

        <button
          onClick={fetchRules}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Rules
        </button>
      </div>

      {/* Occupancy Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        {OCCUPANCIES.map((occ) => (
          <button
            key={occ}
            onClick={() => setOccupancy(occ)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              occupancy === occ
                ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building size={16} /> {occ} Rules
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
        <input
          placeholder="Search rule name, clause reference, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 py-3 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Accordion Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule, idx) => {
          const ruleId = rule.id || `rule_${idx}`;
          const isExpanded = !!expandedIds[ruleId];

          return (
            <div key={ruleId} className="autodcr-rules-accordion-item">
              <button
                onClick={() => toggleExpand(ruleId)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-all hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-cyan-400" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base truncate">{rule.rule_name}</h3>
                      {rule.is_mandatory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{rule.clause_reference}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    {rule.min_value ? `>= ${rule.min_value}` : rule.max_value ? `<= ${rule.max_value}` : "Configured"} {rule.unit || ""}
                  </span>
                  {isExpanded ? <ChevronUp size={20} className="text-cyan-400" /> : <ChevronDown size={20} className="text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-3 text-sm text-slate-300">
                  <p className="leading-relaxed">{rule.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Category:</span>
                      <span className="text-white font-bold">{rule.category || occupancy}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Clause Code:</span>
                      <span className="text-cyan-400 font-bold">{rule.clause_reference}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Requirement:</span>
                      <span className="text-emerald-400 font-bold">
                        {rule.min_value ? `Min ${rule.min_value}` : rule.max_value ? `Max ${rule.max_value}` : "Mandatory"} {rule.unit || ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            No rules match search query.
          </div>
        )}
      </div>
    </div>
  );
}

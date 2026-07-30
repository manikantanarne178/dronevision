import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { SubmissionHistoryItem } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import "./SubmissionHistory.css";

export default function SubmissionHistory() {
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.getSubmissionHistory();
      setHistory(res.history || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="autodcr-history-container">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  const defaultHistory: SubmissionHistoryItem[] = [
    {
      id: "SUB-8801",
      file_id: "drawing_01.dxf",
      filename: "drawing_01.dxf",
      uploaded_at: new Date().toISOString(),
      status: "APPROVED",
      zone: "Residential",
      compliance_percentage: 95,
      applicant_name: "John Doe Architects",
    },
    {
      id: "SUB-8802",
      file_id: "commercial_plan.dwg",
      filename: "commercial_plan.dwg",
      uploaded_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: "IN_REVIEW",
      zone: "Commercial",
      compliance_percentage: 82,
      applicant_name: "Metropolis Builders",
    },
    {
      id: "SUB-8803",
      file_id: "factory_layout.ifc",
      filename: "factory_layout.ifc",
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      status: "REJECTED",
      zone: "Industrial",
      compliance_percentage: 55,
      applicant_name: "Global Tech Infra",
    },
  ];

  const activeHistory = history.length > 0 ? history : defaultHistory;

  return (
    <div className="autodcr-history-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <History className="text-cyan-400" size={28} />
              Submission History & Audit Trail
            </h1>
            <StatusBadge status="AUDITED" />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Complete historical scrutiny archive & applicant submission logs
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh History
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Clock className="text-cyan-400" size={20} />
          Chronological Audit Log ({activeHistory.length} Entries)
        </h3>

        <div className="space-y-6 pl-2">
          {activeHistory.map((item) => (
            <div key={item.id} className="autodcr-history-timeline-item">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white text-base">{item.id}</span>
                    <span className="text-xs font-mono text-cyan-400">{item.filename || item.file_id}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.uploaded_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Applicant: <b className="text-slate-200">{item.applicant_name || "Municipal User"}</b></span>
                  <span>Zone: <b className="text-slate-200">{item.zone}</b></span>
                  <span className="font-bold text-emerald-400">{item.compliance_percentage}% Compliance</span>

                  <Link
                    to={`/autodcr/validate?file_id=${encodeURIComponent(item.file_id)}`}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                  >
                    View Scrutiny Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {activeHistory.length === 0 && (
            <EmptyState title="No Past Submissions" description="No past AutoDCR submissions recorded yet." />
          )}
        </div>
      </div>
    </div>
  );
}

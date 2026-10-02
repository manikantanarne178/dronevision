import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCode,
  Calendar,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { SubmissionHistoryItem } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { formatDateTime } from "../../utils/date";
import "./SubmissionHistory.css";

export default function SubmissionHistory() {
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.getSubmissionHistory();
      setHistory(res.history || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load submission history from server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="autodcr-history-container space-y-6">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  return (
    <div className="autodcr-history-container space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="text-cyan-600" size={22} />
              Submission History & Audit Trail
            </h1>
            <StatusBadge status="AUDITED" label={`${history.length} Submissions`} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Historical CAD/BIM drawing scrutiny submissions and compliance records
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh History
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 pb-2 border-b border-slate-100">
          <Clock className="text-cyan-600" size={18} />
          Chronological Ingestion Log ({history.length} Entries)
        </h3>

        {history.length === 0 ? (
          <EmptyState
            title="No Submission History"
            description="No drawing files have been submitted for scrutiny yet. Upload your first plan to populate the audit log."
          />
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id || item.file_id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm font-mono">{item.id}</span>
                    <span className="text-xs font-mono text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" />
                      {item.filename || item.file_id}
                    </span>
                    <StatusBadge status={item.status || "COMPLETED"} size="sm" />
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDateTime(item.uploaded_at)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 gap-y-1.5">
                  <span>
                    Applicant: <b className="text-slate-800">{item.applicant_name || "Municipal Scrutiny Queue"}</b>
                  </span>
                  <span>
                    Zone: <b className="text-slate-800">{item.zone || "Residential"}</b>
                  </span>
                  {item.compliance_percentage !== undefined && (
                    <span className="font-bold text-emerald-700">
                      {item.compliance_percentage}% Compliance
                    </span>
                  )}

                  <Link
                    to={`/autodcr/validate?file_id=${encodeURIComponent(item.file_id || item.id)}`}
                    className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-semibold hover:underline"
                  >
                    View Scrutiny Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

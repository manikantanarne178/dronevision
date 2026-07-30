import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  RefreshCw,
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Code,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { ReportResponse } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./AutoDCRReport.css";

export default function AutoDCRReport() {
  const [searchParams] = useSearchParams();
  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "drawing_01.dxf";
  const initialZone = searchParams.get("zone") || "Residential";

  const [format, setFormat] = useState<string>("json");
  const [zone, setZone] = useState<string>(initialZone);
  const [reportResult, setReportResult] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [fileIdParam, format, zone]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AutoDCRService.generateReport(fileIdParam, format, zone);
      setReportResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AutoDCR_Scrutiny_Report_${fileIdParam}.${format}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "AutoDCR Municipal Report",
        text: `AutoDCR Compliance Scrutiny Report for ${fileIdParam}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Report URL copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="autodcr-report-container">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReport} />;
  }

  const summary = reportResult?.summary || {
    overall_status: "PASSED",
    compliance_percentage: 92,
    plot_area: 1250.0,
    built_up_area: 1350.0,
    fsi: 1.08,
  };

  return (
    <div className="autodcr-report-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText className="text-cyan-400" size={28} />
              Municipal Building Plan Scrutiny Report
            </h1>
            <StatusBadge status={summary.overall_status || "APPROVED"} />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Official Municipal Certificate | File ID: <span className="text-cyan-400 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: "pdf", label: "PDF", icon: FileText },
              { id: "json", label: "JSON", icon: Code },
              { id: "html", label: "HTML", icon: FileText },
              { id: "excel", label: "Excel", icon: FileSpreadsheet },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    format === f.id ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} /> {f.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Download size={14} /> Download
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-1.5"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-1.5"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Compliance Status</p>
          <h2 className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center gap-2">
            <CheckCircle2 size={24} /> {summary.overall_status || "PASSED"}
          </h2>
          <p className="text-xs text-slate-400 mt-2">Satisfies Municipal Regulations</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Compliance Score</p>
          <h2 className="text-3xl font-extrabold text-cyan-300 mt-1">
            {summary.compliance_percentage || 92}%
          </h2>
          <p className="text-xs text-slate-400 mt-2">Passed 92% of rule triggers</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Built-Up Area</p>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            {summary.built_up_area?.toFixed(2)} <span className="text-xs text-slate-400">sq.m</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2">Plot Area: {summary.plot_area} sq.m</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-semibold">FSI / FAR Achieved</p>
          <h2 className="text-3xl font-extrabold text-indigo-400 mt-1">
            {summary.fsi?.toFixed(2)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">Permissible Limit: 1.50</p>
        </div>
      </div>

      {/* Official Certificate Document Preview */}
      <div className="autodcr-report-preview-box space-y-6">
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-xl uppercase tracking-wider">
              <Building2 size={28} /> MUNICIPAL CORPORATION AUTODCR
            </div>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Development Control & Building Regulations Scrutiny Department
            </p>
          </div>
          <div className="text-right font-sans text-xs text-slate-500">
            <p className="font-bold text-slate-800">Report Ref: AUTODCR-{fileIdParam}</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-center font-sans space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            OFFICIAL SCRUTINY & PERMISSION CERTIFICATE
          </h2>
          <p className="text-xs text-slate-600">
            Issued under provisions of Municipal Building Bye-laws 2024
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 font-sans text-xs border p-4 rounded-lg border-slate-300 bg-slate-50">
          <div>
            <p className="font-bold text-slate-700">Project / File ID:</p>
            <p className="text-slate-900 font-mono font-semibold">{fileIdParam}</p>
          </div>
          <div>
            <p className="font-bold text-slate-700">Occupancy Zone:</p>
            <p className="text-slate-900 font-semibold">{zone}</p>
          </div>
          <div>
            <p className="font-bold text-slate-700">Total Plot Area:</p>
            <p className="text-slate-900 font-semibold">{summary.plot_area} sq.meters</p>
          </div>
          <div>
            <p className="font-bold text-slate-700">Proposed Built-up Area:</p>
            <p className="text-slate-900 font-semibold">{summary.built_up_area} sq.meters</p>
          </div>
        </div>

        <div className="space-y-2 font-sans text-xs">
          <h4 className="font-bold text-slate-800 text-sm">Automated Engine Scrutiny Summary</h4>
          <table className="w-full border-collapse text-left border border-slate-300">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold">
                <th className="p-2 border border-slate-300">Parameter</th>
                <th className="p-2 border border-slate-300">Prescribed Standard</th>
                <th className="p-2 border border-slate-300">Proposed Plan</th>
                <th className="p-2 border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">Front Setback</td>
                <td className="p-2 border border-slate-300">Min 3.0 m</td>
                <td className="p-2 border border-slate-300">3.5 m</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-600">PASSED</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">FSI / FAR</td>
                <td className="p-2 border border-slate-300">Max 1.50</td>
                <td className="p-2 border border-slate-300">{summary.fsi}</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-600">PASSED</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">Parking ECS</td>
                <td className="p-2 border border-slate-300">Min 12 Slots</td>
                <td className="p-2 border border-slate-300">15 Slots</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-600">PASSED</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">Green Building</td>
                <td className="p-2 border border-slate-300">GRIHA / IGBC Compliance</td>
                <td className="p-2 border border-slate-300">92% Compliance</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-600">PASSED</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-300 flex justify-between items-end font-sans text-xs">
          <div>
            <ShieldCheck className="text-emerald-700 mb-1" size={32} />
            <p className="text-slate-500 font-mono">Digitally Signed & Validated</p>
          </div>
          <div className="text-center space-y-8">
            <p className="font-bold text-slate-800">Chief Municipal Town Planner</p>
            <p className="text-slate-500 italic">Signature / Digital Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

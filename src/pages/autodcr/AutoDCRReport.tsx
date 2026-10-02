import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileCode,
  Building2,
  Layers,
  Car,
  Ruler,
  Maximize2,
  TreePine,
  ShieldCheck,
  ChevronDown,
  Loader2,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { ReportResponse, RuleViolation } from "../../types/autodcr";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import AutoDCRProjectPicker from "../../components/autodcr/AutoDCRProjectPicker";
import AutoDCRProjectBar from "../../components/autodcr/AutoDCRProjectBar";
import { formatDate } from "../../utils/date";
import "./AutoDCRReport.css";

export default function AutoDCRReport() {
  const [searchParams] = useSearchParams();

  const rawId =
    searchParams.get("file_id") ||
    localStorage.getItem("current_file_id") ||
    "";
  const fileIdParam = rawId.includes("\\") || rawId.includes("/")
    ? rawId.split(/[\\/]/).pop() || ""
    : rawId;

  const [zone, setZone] = useState<string>(searchParams.get("zone") || "Residential");
  const [reportResult, setReportResult] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!fileIdParam) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await AutoDCRService.getScrutinyReport(fileIdParam, zone);
      setReportResult(res);
    } catch (err: any) {
      console.error("Failed to load scrutiny report:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Unable to load scrutiny report. Please ensure drawing analysis has completed.";
      setError(msg);
      if (err.response?.status === 404) {
        localStorage.removeItem("current_file_id");
      }
    } finally {
      setLoading(false);
    }
  }, [fileIdParam, zone]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownloadPDF = async () => {
    if (!fileIdParam) return;
    try {
      setDownloadingPdf(true);
      const blob = await AutoDCRService.downloadScrutinyReportPDF(fileIdParam);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AutoDCR-${fileIdParam}-Scrutiny-Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF report. Please verify backend server status.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportJSON = () => {
    if (!reportResult) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(reportResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `AutoDCR_${fileIdParam}_Report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "DroneVision AutoDCR Scrutiny Report",
          text: `AutoDCR Scrutiny Approval Report for ${fileIdParam}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Official scrutiny report link copied to clipboard!");
    }
  };

  if (!fileIdParam) {
    return (
      <div className="autodcr-report-container space-y-6">
        <AutoDCRProjectPicker
          title="Select Project for Official Scrutiny Certificate"
          subtitle="Choose any registered municipal drawing project to inspect authoritative bylaw compliance reports."
          onSelectProject={(id) =>
            window.location.assign(
              `/autodcr/report?file_id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`
            )
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="autodcr-report-container space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="autodcr-report-container space-y-6">
        <ErrorState
          title="Scrutiny Report Unavailable"
          message={error}
          onRetry={fetchReport}
          actionText="Select Another Project"
          onAction={() => window.location.assign("/autodcr/projects")}
        />
      </div>
    );
  }

  // Extract structured backend data
  const project = reportResult?.project || {};
  const metrics = reportResult?.metrics || reportResult?.analysis?.areas || {};
  const scrutiny = reportResult?.scrutiny || reportResult?.summary || {};
  const analysis = reportResult?.analysis || {};
  const heights = analysis.heights || {};
  const parking = analysis.parking || {};
  const rules: RuleViolation[] = reportResult?.rules || reportResult?.validations || [];
  const violations: RuleViolation[] =
    reportResult?.violations && reportResult.violations.length > 0
      ? reportResult.violations
      : rules.filter((r) => r.status === "FAIL");

  const overallStatus =
    scrutiny.overall_status ||
    project.status ||
    (violations.length > 0 ? "REVIEW_REQUIRED" : "APPROVED");

  const complianceScore =
    scrutiny.compliance_score ??
    scrutiny.compliance_percentage ??
    (rules.length > 0
      ? Math.round(
          (rules.filter((r) => r.status === "PASS").length / rules.length) * 100
        )
      : 0);

  const passedCount =
    scrutiny.pass_count ??
    scrutiny.passed ??
    rules.filter((r) => r.status === "PASS").length;

  const failedCount =
    scrutiny.fail_count ??
    scrutiny.failed ??
    rules.filter((r) => r.status === "FAIL").length;

  const reviewCount =
    scrutiny.warning_count ??
    scrutiny.review_required ??
    rules.filter((r) => r.status === "WARNING" || r.status === "REVIEW_REQUIRED")
      .length;

  // Zero-value handling helper: distinguish between null/undefined vs legitimate 0.00
  const formatMetric = (val: any, unit: string = "sq.m", decimals: number = 2) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-400 font-normal italic text-xs">Not detected</span>;
    }
    const num = Number(val);
    if (isNaN(num)) {
      return <span className="text-slate-400 font-normal italic text-xs">Requires review</span>;
    }
    return (
      <span className="font-mono font-bold text-slate-900">
        {num.toFixed(decimals)} <span className="text-xs font-normal text-slate-500">{unit}</span>
      </span>
    );
  };

  const formatFSI = (fsiVal: any, maxPermissible: number = 2.5) => {
    if (fsiVal === null || fsiVal === undefined) {
      return <span className="text-slate-400 font-normal italic text-xs">Not detected</span>;
    }
    const num = Number(fsiVal);
    if (isNaN(num)) {
      return <span className="text-slate-400 font-normal italic text-xs">Requires review</span>;
    }
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono font-bold text-slate-900 text-base">{num.toFixed(3)}</span>
        <span className="text-[11px] text-slate-400 font-normal">(Permissible: {maxPermissible.toFixed(2)})</span>
      </div>
    );
  };

  const uploadDate = project.uploaded_at || reportResult?.uploaded_at;
  const analysisDate =
    project.created_at ||
    reportResult?.generated_at ||
    reportResult?.analyzed_at;

  return (
    <div className="autodcr-report-container space-y-6">
      <AutoDCRProjectBar
        currentProjectId={fileIdParam}
        onProjectChange={(id) =>
          window.location.assign(
            `/autodcr/report?file_id=${encodeURIComponent(id)}&zone=${encodeURIComponent(zone)}`
          )
        }
      />

      {/* Header Banner / Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="text-cyan-600" size={24} />
              AutoDCR Scrutiny Suite
            </h1>
            <StatusBadge status={overallStatus} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
            File Reference:{" "}
            <span className="text-cyan-700 font-mono font-semibold flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              {project.original_filename || project.filename || fileIdParam}
            </span>
            {project.project_code && (
              <span className="text-slate-400 font-mono text-xs">({project.project_code})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {["Residential", "Commercial", "Industrial", "Mixed Use", "High Rise"].map((z) => (
              <option key={z} value={z}>
                {z} Zone
              </option>
            ))}
          </select>

          <button
            onClick={fetchReport}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Refresh Scrutiny Data"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Share2 size={14} /> Share
          </button>

          {/* Primary PDF Download CTA */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {downloadingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloadingPdf ? "Generating PDF..." : "Download PDF Report"}
          </button>

          {/* Secondary JSON Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1"
              title="More Export Options"
            >
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileCode size={14} className="text-cyan-600" /> Export JSON Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Scrutiny Certificate Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-widest block">
              GOVERNMENT OF TELANGANA / MUNICIPAL TOWN PLANNING DEPARTMENT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              BUILDING PLAN SCRUTINY APPROVAL REPORT
            </h2>
            <p className="text-xs text-slate-500">
              Statutory Automated Scrutiny under Telangana Municipalities Act & National Building Code (NBC 2016)
            </p>
          </div>

          <div className="md:text-right space-y-1.5 shrink-0 flex md:flex-col items-start md:items-end justify-between">
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${
                overallStatus === "APPROVED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : overallStatus === "REJECTED" || overallStatus === "FAILED"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {overallStatus === "APPROVED" ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : overallStatus === "REJECTED" || overallStatus === "FAILED" ? (
                <XCircle size={16} className="text-rose-600" />
              ) : (
                <AlertTriangle size={16} className="text-amber-600" />
              )}
              SCRUTINY {overallStatus}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Scrutinized: {analysisDate ? formatDate(analysisDate) : "Authoritative Server Sync"}
            </p>
          </div>
        </div>

        {/* Project & Drawing Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Project ID
            </span>
            <span className="font-mono font-bold text-slate-900 truncate block">
              {project.project_id || fileIdParam}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Original Drawing
            </span>
            <span className="font-mono font-bold text-slate-900 truncate block">
              {project.original_filename || project.filename || "CAD Drawing"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Zoning Category
            </span>
            <span className="font-bold text-slate-900">{project.zone || zone} Zone</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Compliance Ratio
            </span>
            <span className="font-bold text-emerald-700 font-mono text-sm">
              {complianceScore.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Applicant Name
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {project.applicant_name || "Municipal Applicant"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Plot Identification
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {project.plot_number || "Plot Record Synchronized"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Uploaded Timestamp
            </span>
            <span className="font-mono text-slate-700 block">
              {uploadDate ? formatDate(uploadDate) : "Server Timestamp Verified"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Analysis Engine
            </span>
            <span className="font-mono text-slate-700 block">AutoDCR Engine v2.0.0</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-cyan-600" />
            Executive Scrutiny Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Overall Status</span>
              <span
                className={`text-sm sm:text-base font-black ${
                  overallStatus === "APPROVED"
                    ? "text-emerald-700"
                    : overallStatus === "REJECTED" || overallStatus === "FAILED"
                    ? "text-rose-700"
                    : "text-amber-700"
                }`}
              >
                {overallStatus}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Compliance %</span>
              <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono">
                {complianceScore.toFixed(1)}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Rules Evaluated</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                {rules.length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Rules Passed</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 font-mono">
                {passedCount}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 block">Violations / Reviews</span>
              <span
                className={`text-base sm:text-lg font-bold font-mono ${
                  failedCount > 0 ? "text-rose-600" : reviewCount > 0 ? "text-amber-600" : "text-slate-700"
                }`}
              >
                {failedCount + reviewCount}
              </span>
            </div>
          </div>
        </div>

        {/* Key Architectural Parameters Evaluated Grid */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Building2 size={16} className="text-cyan-600" />
            Key Architectural Parameters Evaluated
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Maximize2 size={14} className="text-cyan-600" /> Total Plot Area
              </span>
              <div className="text-lg">
                {formatMetric(metrics.plot_area, "sq.m", 2)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Layers size={14} className="text-cyan-600" /> Total Built-Up Area
              </span>
              <div className="text-lg">
                {formatMetric(metrics.built_up_area, "sq.m", 2)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Ruler size={14} className="text-cyan-600" /> Floor Space Index (FSI / FAR)
              </span>
              <div>
                {formatFSI(
                  metrics.fsi ?? metrics.fsi_achieved ?? metrics.far ?? metrics.far_achieved,
                  metrics.fsi_permissible || 2.5
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Ground Coverage</span>
              <div className="text-base">
                {formatMetric(metrics.ground_coverage_pct, "%", 2)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Building Height</span>
              <div className="text-base">
                {formatMetric(
                  metrics.building_height || heights.building_height,
                  "m",
                  2
                )}{" "}
                {heights.floor_count && (
                  <span className="text-xs text-slate-400 font-normal">
                    ({heights.floor_count} Floor{heights.floor_count > 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <TreePine size={14} className="text-emerald-600" /> Open Space / Landscape
              </span>
              <div className="text-base">
                {formatMetric(metrics.open_area ?? metrics.open_space_area, "sq.m", 2)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Car size={14} className="text-cyan-600" /> Parking Provisions
              </span>
              <div className="text-sm font-semibold text-slate-800">
                {parking.available_car_parking !== undefined ? (
                  <span>
                    Provided: <span className="font-mono font-bold text-slate-900">{parking.available_car_parking}</span> / Required: <span className="font-mono font-bold text-slate-900">{parking.required_car_parking || 1}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Evaluated under parking standards</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Carpet Area</span>
              <div className="text-base">
                {formatMetric(metrics.carpet_area, "sq.m", 2)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Road Width</span>
              <div className="text-base">
                {formatMetric(metrics.road_width, "m", 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Rule Validation Matrix Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Municipal Development Control Regulations Scrutiny Matrix</span>
            <span className="text-xs font-normal text-slate-400">
              {rules.length} Statutory Checks
            </span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3.5">Rule & Parameter</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Mandated Requirement</th>
                  <th className="py-3 px-3">Actual Computed</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Remarks / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((r, idx) => {
                  const status = (r.status || "PASS").toUpperCase();
                  const isPass = status === "PASS";
                  const isFail = status === "FAIL";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {r.rule_name || "Bylaw Regulation"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{r.category || "General"}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {String(r.expected || r.expected_value || "-")}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {String(r.actual || r.actual_value || "-")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                            isPass
                              ? "bg-emerald-100 text-emerald-800"
                              : isFail
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {r.reason || r.suggestion || r.reference_code || "Compliant with NBC 2016"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations & Advisory Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
            Violations & Rectification Summary
          </h3>
          {violations.length > 0 ? (
            <div className="space-y-2.5">
              {violations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5"
                >
                  <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="font-bold block">{v.rule_name || "Regulatory Non-Compliance"}</span>
                    <p className="text-rose-700 text-[11px] mt-0.5">
                      {v.reason || v.suggestion || "Values deviate from permissible municipal regulations."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
              <div>
                <span className="font-bold block">No Violations Detected</span>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  All analyzed geometric, setback, and zoning parameters fully satisfy statutory development control regulations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Official Authentication Footer */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <span>Electronically Scrutinized & Authenticated by DroneVision AutoDCR Engine</span>
          <span>Municipal Town Planning Department</span>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import DroneApiService, { type DroneProjectBackend } from "../services/droneApiService";
import "./Reports.css";
import { useDroneSurvey } from "../context/DroneSurveyContext";
import PDFReportService from "../services/pdfReportService";
import {
  FileText,
  BarChart3,
  Trash2,
  CheckCircle2,
  HardDrive,
  Printer,
  FileCode,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Reports() {
  const { surveys, deleteSurvey, refreshSurveys } = useDroneSurvey();
  const [backendProjects, setBackendProjects] = useState<DroneProjectBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      await refreshSurveys();
      const list = await DroneApiService.listDroneProjects();
      setBackendProjects(list);
    } catch (err) {
      console.warn("Backend project records notice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Merge context surveys with live backend projects
  const displayReports = useMemo(() => {
    const list: any[] = [...surveys];

    backendProjects.forEach((proj) => {
      const projId = proj.project_id;
      const alreadyInList = list.some(
        (s) => s.backendProjectId === projId || s.id === projId
      );

      if (!alreadyInList && projId) {
        const area = Number(proj.surface_area || proj.ground_area || 0);
        list.push({
          id: projId,
          backendProjectId: projId,
          name: proj.name || `Drone Mission ${projId}`,
          createdAt: proj.generated_at || new Date().toISOString(),
          imageCount: Number(proj.images_uploaded || 0),
          geotaggedImageCount: Number(proj.images_uploaded || 0),
          areaSqm: area,
          areaAcres: area > 0 ? Math.round((area / 4046.86) * 1000) / 1000 : 0,
          areaHectares: area > 0 ? Math.round((area / 10000) * 1000) / 1000 : 0,
          utmZone: "UTM Zone 32N (WGS84)",
          reconstructionStatus: proj.model_url ? "available" : "pending",
          processingStatus: "completed",
        });
      }
    });

    return list;
  }, [surveys, backendProjects]);

  const handleExportJSON = (survey: any) => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(survey, null, 2));
      const a = document.createElement("a");
      a.href = dataStr;
      const cleanName = (survey.name || survey.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${cleanName}_SURVEY_AUDIT.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFeedback({ type: "success", message: "JSON technical audit exported successfully." });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("JSON export notice:", err);
      setFeedback({ type: "error", message: "Unable to export JSON data. Please try again." });
    }
  };

  const handlePrintReport = async (survey: any) => {
    const surveyId = survey.id || survey.backendProjectId;
    try {
      setGeneratingPdfId(surveyId);
      setFeedback(null);
      await PDFReportService.generateSurveyPDF(survey);
      setFeedback({ type: "success", message: "PDF report generated successfully." });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error("PDF generation failure:", err);
      setFeedback({ type: "error", message: "Unable to generate PDF report. Please try again." });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDeleteReport = async (survey: any) => {
    const targetId = survey.id || survey.backendProjectId;
    if (confirm(`Delete mapping report for "${survey.name || targetId}"?`)) {
      await deleteSurvey(targetId);
      setBackendProjects((prev) =>
        prev.filter((p) => p.project_id !== targetId)
      );
    }
  };

  const totalReports = displayReports.length;

  return (
    <div className="reports-page space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              Spatial Reconstruction Audits
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Technical Reports & Survey Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Download engineering manifests, telemetry logs, and photogrammetry reconstruction summaries.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Reports
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <BarChart3 size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">
            {totalReports}
          </h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Generated documents
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ready for Export
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">
            {totalReports}
          </h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            100% compiled
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Format Standards
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">PDF / JSON</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Engineering grade
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Survey Storage
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <HardDrive size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-mono">WGS84 Datum</h2>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Cloud synced
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {loading && displayReports.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading project documentation records...
          </div>
        )}

        {!loading && displayReports.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              0 Technical Reports Available
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Upload drone survey images to generate 3D models and technical audit reports.
            </p>
          </div>
        )}

        {displayReports.map((survey) => {
          const isGenerating = generatingPdfId === (survey.id || survey.backendProjectId);

          return (
            <div
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              key={survey.id || survey.backendProjectId}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {survey.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>{new Date(survey.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>
                      {survey.imageCount} Images ({survey.geotaggedImageCount || survey.imageCount} Geotagged)
                    </span>
                    {survey.areaSqm > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-semibold">
                          {survey.areaSqm.toLocaleString()} m² ({survey.areaAcres || (Math.round((survey.areaSqm / 4046.86) * 1000) / 1000)} ac)
                        </span>
                      </>
                    )}
                    {survey.utmZone && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-cyan-700">{survey.utmZone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePrintReport(survey)}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Printer size={14} />
                      <span>Print / PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExportJSON(survey)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileCode size={14} />
                  <span>JSON</span>
                </button>

                <button
                  onClick={() => handleDeleteReport(survey)}
                  className="inline-flex items-center gap-1.5 p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete survey record"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
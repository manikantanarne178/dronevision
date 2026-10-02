import { useEffect, useState } from "react";
import API from "../api";
import "./Reports.css";
import { useDroneSurvey } from "../context/DroneSurveyContext";
import {
  FileText,
  BarChart3,
  Trash2,
  CheckCircle2,
  HardDrive,
  Printer,
  FileCode,
} from "lucide-react";

export default function Reports() {
  const { surveys, deleteSurvey, setActiveSurveyId } =
    useDroneSurvey();
  const [backendProjects, setBackendProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/api/projects/");
      if (res.data?.success && Array.isArray(res.data.projects)) {
        setBackendProjects(res.data.projects);
      }
    } catch (err) {
      console.warn("Backend project records notice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = (survey: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(survey, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${survey.name || survey.id}_SURVEY_AUDIT.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrintReport = (survey: any) => {
    setActiveSurveyId(survey.id);
    window.print();
  };

  const totalReports = Math.max(surveys.length, backendProjects.length);

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
        {loading && surveys.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading project documentation records...
          </div>
        )}

        {!loading && surveys.length === 0 && backendProjects.length === 0 && (
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

        {surveys.map((survey) => (
          <div
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            key={survey.id}
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
                  <span>{survey.imageCount} Images ({survey.geotaggedImageCount} Geotagged)</span>
                  {survey.areaSqm > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        {survey.areaSqm.toLocaleString()} m² ({survey.areaAcres} ac)
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer size={14} />
                Print / PDF
              </button>

              <button
                onClick={() => handleExportJSON(survey)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FileCode size={14} />
                JSON
              </button>

              <button
                onClick={() => deleteSurvey(survey.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
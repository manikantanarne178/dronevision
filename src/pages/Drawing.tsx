import { useState } from "react";
import API from "../api";
import UploadCard from "../components/drawing/UploadCard";
import AnalysisSummary from "../components/drawing/AnalysisSummary";
import RuleTable from "../components/drawing/RuleTable";
import DrawingInfo from "../components/drawing/DrawingInfo";
import { useDroneSurvey } from "../context/DroneSurveyContext";
import type { DrawingResponse } from "../types/drawing";
import "./Drawing.css";
import {
  FileCode2,
  Layers,
  AlertCircle,
  FileDown,
} from "lucide-react";

export default function Drawing() {
  const { activeSurvey, exportDXF } = useDroneSurvey();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DrawingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    if (!file) return;

    setError(null);
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post<DrawingResponse>(
        "/api/drawings/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to parse CAD drawing. Please ensure the file is in valid DXF format."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawing-page space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <FileCode2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              CAD & DXF Vector Generation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            CAD Drawing & Survey DXF Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Export georeferenced survey layers into AutoCAD DXF format or parse architectural floor plans.
          </p>
        </div>

        {/* Survey DXF Export Button */}
        {activeSurvey && (
          <button
            onClick={() => exportDXF(activeSurvey)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <FileDown size={16} />
            Export Survey DXF ({activeSurvey.surveyBoundary.length > 0 ? "Georeferenced" : "Telemetry"})
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Survey DXF Summary Card */}
      {activeSurvey && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center font-bold">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Survey CAD Export Matrix
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target Mission: <b>{activeSurvey.name}</b>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ACAD 2000 (AC1015)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                SURVEY_BOUNDARY
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {activeSurvey.surveyBoundary.length} Vertices
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                Closed Polygon
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                FLIGHT_PATH
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {activeSurvey.flightPath.length} Waypoints
              </span>
              <span className="text-[10px] text-cyan-600 block mt-0.5 font-medium">
                Trajectory Polyline
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                PHOTO_POINTS
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {activeSurvey.geotaggedImageCount} Coordinates
              </span>
              <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">
                Indexed Points & Labels
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                MEASUREMENTS
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {activeSurvey.areaSqm > 0 ? `${activeSurvey.areaSqm.toLocaleString()} m²` : "Pending"}
              </span>
              <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
                Footprint Annotation
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CAD Drawing Upload & Scrutiny Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Upload DXF Architectural Drawing for Ingestion
        </h3>
        <UploadCard
          file={file}
          setFile={setFile}
          upload={upload}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3 text-cyan-700 text-sm font-semibold">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            <span>Parsing DXF entities, layers and boundary polygons...</span>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <DrawingInfo result={result} />
          <AnalysisSummary result={result} />
          {result.rules && result.rules.length > 0 && (
            <RuleTable rules={result.rules} />
          )}
        </div>
      )}
    </div>
  );
}
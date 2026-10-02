import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Trash2,
  Plus,
  ArrowRight,
  AlertOctagon,
  Camera,
  Activity,
  Zap,
  RotateCcw,
  Server,
} from "lucide-react";

import ImageUploader from "../components/upload/ImageUploader";
import ImageGrid from "../components/upload/ImageGrid";
import ProjectSummary from "../components/upload/ProjectSummary";
import { useDroneSurvey, type UploadProgressDetail } from "../context/DroneSurveyContext";
import { pingBackendHealth } from "../api";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [surveyName, setSurveyName] = useState<string>("");
  const [progressDetail, setProgressDetail] = useState<UploadProgressDetail | null>(
    null
  );
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const {
    createSurvey,
    isUploading,
    uiState,
    pipelineError,
    lastUploadId,
    clearError,
  } = useDroneSurvey();

  useEffect(() => {
    let mounted = true;
    pingBackendHealth().then((healthy) => {
      if (mounted) {
        setBackendOnline(healthy);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleProcessSurvey = async () => {
    if (files.length === 0) {
      alert("Please upload drone images first.");
      return;
    }

    clearError();

    try {
      const survey = await createSurvey(
        files,
        surveyName || undefined,
        (detail) => {
          setProgressDetail(detail);
        }
      );

      console.log("[PIPELINE_COMPLETE] Survey created successfully:", survey);

      // Navigate to 3D model viewer or flight path
      if (survey.backendProjectId && survey.reconstructionStatus === "available") {
        navigate(`/viewer/${survey.backendProjectId}`);
      } else {
        navigate(`/flight-path`);
      }
    } catch (err: any) {
      console.error("[PIPELINE_ERROR_CAUGHT] Survey processing halted:", err);
      // Handled and stored in context as pipelineError
    }
  };

  const getUIStateBadge = () => {
    switch (uiState) {
      case "VALIDATING":
        return { label: "VALIDATING DATASET", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "UPLOADING":
        return { label: "UPLOADING IMAGES", color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      case "UPLOAD_COMPLETE":
        return { label: "UPLOAD COMPLETE", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "RECONSTRUCTION":
        return { label: "3D RECONSTRUCTION", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "GNSS_EXTRACTION":
        return { label: "GNSS TELEMETRY", color: "bg-sky-50 text-sky-700 border-sky-200" };
      case "FLIGHT_PATH":
        return { label: "FLIGHT PATH CALCULATION", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "POINT_CLOUD":
        return { label: "POINT CLOUD GENERATION", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "MODEL_GENERATION":
        return { label: "3D GLB GENERATION", color: "bg-teal-50 text-teal-700 border-teal-200" };
      case "FINALIZING":
        return { label: "FINALIZING MISSION", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "COMPLETED":
        return { label: "COMPLETED", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "FAILED":
        return { label: "FAILED", color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "IDLE":
      default:
        return { label: "READY FOR INGESTION", color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const stateBadge = getUIStateBadge();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              Aerial Photogrammetry Ingestion
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Upload Drone Survey Dataset
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ingest high-resolution aerial datasets to extract GNSS telemetry, flight waypoints, and generate 3D point clouds.
          </p>
        </div>

        {/* State Machine Status Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono uppercase tracking-wider ${stateBadge.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            State: {stateBadge.label}
          </span>

          {backendOnline === true ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              Backend: Online
            </span>
          ) : backendOnline === false ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              Backend: Cold Start
            </span>
          ) : null}
        </div>
      </div>

      {/* Explicit Technical Diagnostic Error Box */}
      {pipelineError && (
        <div className="bg-rose-50/90 border border-rose-300 rounded-2xl p-5 shadow-xs text-rose-900 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-mono text-[11px] font-bold uppercase tracking-wider">
                    Pipeline Stage: {pipelineError.stage}
                  </span>
                  {pipelineError.httpStatus && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-mono text-[11px] font-bold">
                      HTTP {pipelineError.httpStatus}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-rose-950">
                  {pipelineError.errorMessage}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
              {lastUploadId && (
                <button
                  onClick={() => {
                    clearError();
                    createSurvey(files, surveyName || undefined, (d) => setProgressDetail(d), lastUploadId);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Reconstruction
                </button>
              )}
              <button
                onClick={() => {
                  clearError();
                  handleProcessSurvey();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Full Pipeline
              </button>
            </div>
          </div>

          {/* Technical Diagnostics Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-xl border border-rose-200 text-[11px] font-mono">
            <div>
              <span className="text-rose-500 font-semibold block uppercase tracking-wider text-[10px]">
                Target Endpoint
              </span>
              <span className="text-slate-800 break-all font-medium">
                {pipelineError.endpoint}
              </span>
            </div>
            <div>
              <span className="text-rose-500 font-semibold block uppercase tracking-wider text-[10px]">
                Error Identifier
              </span>
              <span className="text-slate-800 font-medium">
                {pipelineError.errorName}
              </span>
            </div>
            <div>
              <span className="text-rose-500 font-semibold block uppercase tracking-wider text-[10px]">
                Request ID / Upload ID
              </span>
              <span className="text-slate-800 font-medium">
                {pipelineError.requestId || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Survey Name Input Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Survey / Mission Name (Optional)
        </label>
        <input
          type="text"
          value={surveyName}
          disabled={isUploading}
          onChange={(e) => {
            clearError();
            setSurveyName(e.target.value);
          }}
          placeholder="e.g., Construction Site Survey Phase 1 - Block A"
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:bg-slate-100"
        />
      </div>

      {/* Uploader Box */}
      {files.length === 0 && (
        <ImageUploader
          onFilesSelected={(newFiles) => {
            clearError();
            setFiles((prev) => [...prev, ...newFiles]);
          }}
        />
      )}

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="space-y-6">
          <ProjectSummary files={files} />

          {/* Action header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <h2 className="text-base font-semibold text-slate-900">
                  Ingested Imagery
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {files.length} {files.length === 1 ? "Image" : "Images"}
                </span>
              </div>

              {!isUploading && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById("imageInput")?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add More Images
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setFiles([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <ImageGrid
              files={files}
              removeFile={(index) => {
                if (!isUploading) {
                  clearError();
                  setFiles(files.filter((_, i) => i !== index));
                }
              }}
            />
          </div>

          {/* Real-time Streaming Upload Progress Card */}
          {isUploading && progressDetail && (
            <div className="bg-white rounded-2xl border border-cyan-300 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
                    <Activity className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {progressDetail.stage}
                    </h3>
                    {progressDetail.loadedMB && progressDetail.totalMB && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Transferred: <b>{progressDetail.loadedMB} MB</b> / {progressDetail.totalMB} MB
                        {progressDetail.uploadSpeed && (
                          <span className="ml-2 text-cyan-700 font-semibold">
                            ({progressDetail.uploadSpeed})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-base font-bold font-mono text-cyan-700">
                    {progressDetail.percentage}%
                  </span>
                </div>
              </div>

              {/* Multi-segment styled progress track */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressDetail.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="font-mono">
                  Phase: {progressDetail.pipelineStage || "BINARY TRANSFER"}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Zap size={12} className="text-amber-500" /> High Throughput Pipe Active
                </span>
              </div>
            </div>
          )}

          {/* Process Trigger */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleProcessSurvey}
              disabled={isUploading || files.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Photogrammetry Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process Survey & Map Flight Path ({files.length} Images)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
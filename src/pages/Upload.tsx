import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  Camera,
} from "lucide-react";

import ImageUploader from "../components/upload/ImageUploader";
import ImageGrid from "../components/upload/ImageGrid";
import ProjectSummary from "../components/upload/ProjectSummary";
import { useDroneSurvey } from "../context/DroneSurveyContext";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [surveyName, setSurveyName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [progressPct, setProgressPct] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { createSurvey } = useDroneSurvey();

  const handleProcessSurvey = async () => {
    if (files.length === 0) {
      alert("Please upload drone images first.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgressPct(10);
    setProcessingStage("Parsing EXIF headers & GPS coordinates...");

    try {
      const survey = await createSurvey(
        files,
        surveyName || undefined,
        (stage, pct) => {
          setProcessingStage(stage);
          setProgressPct(pct);
        }
      );

      console.log("Survey created successfully:", survey);

      // Navigate to flight path or viewer
      if (survey.backendProjectId && survey.reconstructionStatus === "available") {
        navigate(`/viewer/${survey.backendProjectId}`);
      } else {
        navigate(`/flight-path`);
      }
    } catch (err: any) {
      console.error("Survey processing error:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Processing failed. Please check network connection and file formats.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

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
            Ingest aerial drone imagery to extract GNSS telemetry, flight waypoints, and generate 3D point clouds.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
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
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="e.g., Construction Site Survey Phase 1 - Block A"
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
        />
      </div>

      {/* Uploader Box */}
      {files.length === 0 && (
        <ImageUploader
          onFilesSelected={(newFiles) =>
            setFiles((prev) => [...prev, ...newFiles])
          }
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
                  onClick={() => setFiles([])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            </div>

            <ImageGrid
              files={files}
              removeFile={(index) =>
                setFiles(files.filter((_, i) => i !== index))
              }
            />
          </div>

          {/* Processing Progress Indicator */}
          {uploading && (
            <div className="bg-white rounded-xl border border-cyan-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-cyan-800 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  {processingStage || "Processing..."}
                </span>
                <span className="text-cyan-700 font-mono">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Process Trigger */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleProcessSurvey}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {uploading ? (
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
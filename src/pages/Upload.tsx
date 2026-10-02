import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Sparkles, Trash2, Plus, ArrowRight, AlertCircle } from "lucide-react";

import ImageUploader from "../components/upload/ImageUploader";
import ImageGrid from "../components/upload/ImageGrid";
import ProjectInfo from "../components/upload/ProjectInfo";
import ProjectSummary from "../components/upload/ProjectSummary";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const generateModel = async () => {
    if (files.length === 0) {
      alert("Please upload images first.");
      return;
    }

    setError(null);
    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      console.log("Uploading images to live backend...");
      await API.post("/api/upload/images", formData);

      console.log("Generating 3D Model...");
      const response = await API.post("/api/reconstruction/generate", {});

      console.log(response.data);
      const projectId = response.data?.project_id;

      if (!projectId) {
        alert("Project ID not returned by backend.");
        return;
      }

      navigate(`/viewer/${projectId}`);
    } catch (err: any) {
      console.error("3D Model Generation Error:", err);
      const msg =
        err.response?.data?.detail ||
        (err.code === "ECONNABORTED"
          ? "Upload connection timed out. Live Render server may be waking up, please retry."
          : "3D reconstruction failed. Please check your uploaded images and network connection.");
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Upload Drone Survey Images
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingest aerial photogrammetry datasets to generate georeferenced 3D point clouds and meshes.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Metadata */}
      <ProjectInfo />

      {/* Uploader Box */}
      {files.length === 0 && (
        <div className="mt-6">
          <ImageUploader
            onFilesSelected={(newFiles) =>
              setFiles((prev) => [...prev, ...newFiles])
            }
          />
        </div>
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

          {/* Process Trigger */}
          <div className="flex justify-end pt-2">
            <button
              onClick={generateModel}
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
                  <span>Generate 3D Model ({files.length} Images)</span>
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
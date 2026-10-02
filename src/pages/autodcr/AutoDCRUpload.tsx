import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import ProgressBar from "../../components/common/ProgressBar";
import type { UploadResponse } from "../../types/autodcr";
import "./AutoDCRUpload.css";

const ALLOWED_EXTENSIONS = [".dxf", ".dwg", ".ifc", ".pdf"];
const MAX_FILE_SIZE_MB = 50;

export default function AutoDCRUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<UploadResponse | null>(null);

  const validateFiles = (fileList: FileList | File[]): File[] => {
    const valid: File[] = [];
    let errMessage = null;

    Array.from(fileList).forEach((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errMessage = `Unsupported file type: ${file.name}. Allowed: DWG, DXF, IFC, PDF.`;
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errMessage = `File size exceeds ${MAX_FILE_SIZE_MB}MB limit: ${file.name}.`;
        return;
      }
      valid.push(file);
    });

    if (errMessage) {
      setError(errMessage);
    } else {
      setError(null);
    }
    return valid;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const validFiles = validateFiles(e.target.files);
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const validFiles = validateFiles(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setUploadSuccess(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const primaryFile = files[0];
      const res = await AutoDCRService.uploadDrawing(primaryFile, (pct) => {
        setUploadProgress(pct);
      });

      setUploadSuccess(res);
      const projectId = res.project_id || res.stored_filename || res.file_id || primaryFile.name;
      localStorage.setItem("current_file_id", projectId);
      localStorage.setItem("current_filename", primaryFile.name);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to upload drawing to backend."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToParse = () => {
    const fileId =
      uploadSuccess?.project_id ||
      uploadSuccess?.stored_filename ||
      uploadSuccess?.file_id ||
      files[0]?.name;
    navigate(`/autodcr/parse?file_id=${encodeURIComponent(fileId)}`);
  };

  return (
    <div className="autodcr-upload-container space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Upload Drawing for AutoDCR Scrutiny
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Supports DWG, DXF CAD files, IFC BIM models, and PDF architectural drawings up to 50MB.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileCheck2 className="text-emerald-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-emerald-900 text-sm sm:text-base">
                  Drawing Uploaded & Scrutiny Initiated!
                </h3>
                <p className="text-xs text-emerald-700 font-mono mt-0.5">
                  Project: {uploadSuccess.project_id || uploadSuccess.project_code || "DCR Project"} | File: {uploadSuccess.filename || files[0]?.name}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {uploadSuccess.status || "PROCESSING"}
            </span>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              onClick={() => navigate("/autodcr/projects")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            >
              View in Projects
            </button>
            <button
              onClick={handleProceedToParse}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              Proceed to Parsing & Analysis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Dropzone Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-cyan-600 bg-cyan-50/50 scale-[1.005]"
            : "border-slate-300 hover:border-cyan-600 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept=".dxf,.dwg,.ifc,.pdf"
          onChange={handleFileSelect}
        />

        <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto mb-3 text-cyan-600">
          <UploadCloud size={30} />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          Drag & Drop Architectural Drawings
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-4">
          or <span className="text-cyan-700 font-semibold underline">browse files</span> from your computer
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">.DXF</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">.DWG</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">.IFC</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">.PDF</span>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <ProgressBar
            progress={uploadProgress}
            label="Uploading CAD File to FastAPI Server..."
            color="cyan"
          />
        </div>
      )}

      {/* Selected Files Preview List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => {
                setFiles([]);
                setUploadSuccess(null);
              }}
              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFile(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
            {error && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
              >
                <RefreshCw size={14} /> Retry Upload
              </button>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Uploading...
                </>
              ) : (
                <>
                  Upload & Analyze Drawing <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

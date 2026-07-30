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

      // Upload the primary file
      const primaryFile = files[0];
      const res = await AutoDCRService.uploadDrawing(primaryFile, (pct) => {
        setUploadProgress(pct);
      });

      setUploadSuccess(res);
      // Store current file_id in localStorage for parsing step
      const fileId = res.path || primaryFile.name;
      localStorage.setItem("current_file_id", fileId);
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
    const fileId = uploadSuccess?.path || files[0]?.name;
    navigate(`/autodcr/parse?file_id=${encodeURIComponent(fileId)}`);
  };

  return (
    <div className="autodcr-upload-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Upload Drawing for AutoDCR Scrutiny
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Supports DWG, DXF CAD files, IFC BIM models, and PDF architectural drawings up to 50MB.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle size={20} className="shrink-0 text-rose-400" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 space-y-3">
          <div className="flex items-center gap-3">
            <FileCheck2 className="text-emerald-400" size={24} />
            <div>
              <h3 className="font-bold text-white text-base">
                Drawing Uploaded Successfully!
              </h3>
              <p className="text-xs text-emerald-300">
                Path: {uploadSuccess.path}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleProceedToParse}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
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
        className={`autodcr-upload-dropzone ${isDragging ? "dragging" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept=".dxf,.dwg,.ifc,.pdf"
          onChange={handleFileSelect}
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
          <UploadCloud size={36} className="text-cyan-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          Drag & Drop Architectural Drawings
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          or <span className="text-cyan-400 underline font-semibold">browse files</span> from your computer
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">.DXF</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">.DWG</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">.IFC</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">.PDF</span>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
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
            <h3 className="font-bold text-white text-base">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => {
                setFiles([]);
                setUploadSuccess(null);
              }}
              className="text-xs font-semibold text-rose-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          {files.map((file, idx) => (
            <div key={idx} className="autodcr-upload-file-card">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="text-cyan-400" size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFile(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
            {error && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                <RefreshCw size={16} /> Retry Upload
              </button>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-950 font-bold text-base transition-all shadow-lg shadow-cyan-500/20"
            >
              {uploading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Uploading...
                </>
              ) : (
                <>
                  Upload & Analyze Drawing <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

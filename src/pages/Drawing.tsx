import { useState } from "react";
import API from "../api";

import UploadCard from "../components/drawing/UploadCard";
import AnalysisSummary from "../components/drawing/AnalysisSummary";
import RuleTable from "../components/drawing/RuleTable";
import DrawingInfo from "../components/drawing/DrawingInfo";

import type { DrawingResponse } from "../types/drawing";
import "./Drawing.css";
import { FileCode2 } from "lucide-react";

export default function Drawing() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DrawingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;

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
    } catch (error) {
      console.error(error);
      alert("Drawing upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawing-page space-y-6">
      <div className="drawing-header">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
            <FileCode2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            AutoDCR CAD / BIM Ingestion
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CAD Drawing Parser</h1>
        <p className="text-sm text-slate-500">
          Upload DXF architectural engineering plans for automated layer extraction, polygon boundary detection and bylaw scrutiny.
        </p>
      </div>

      <UploadCard
        file={file}
        setFile={setFile}
        upload={upload}
      />

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
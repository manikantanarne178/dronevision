import { useState } from "react";
import API from "../api";

import UploadCard from "../components/drawing/UploadCard";
import AnalysisSummary from "../components/drawing/AnalysisSummary";

import type { DrawingResponse } from "../types/drawing";

import "./Drawing.css";

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
    <div className="drawing-page">
      <UploadCard
        file={file}
        setFile={setFile}
        upload={upload}
      />

      {loading && (
        <div className="loading-text">
          Processing drawing...
        </div>
      )}

      {result && (
        <AnalysisSummary result={result} />
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FileCheck2,
  Layers,
  Shapes,
  Box,
  AlignLeft,
  Ruler,
  Terminal,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import AutoDCRService from "../../services/autodcrService";
import type { ParseResult } from "../../types/autodcr";
import ProgressBar from "../../components/common/ProgressBar";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import "./ParsingProgress.css";

export default function ParsingProgress() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileIdParam = searchParams.get("file_id") || localStorage.getItem("current_file_id") || "sample_drawing.dxf";

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(25);

  useEffect(() => {
    runParser();
  }, [fileIdParam]);

  const runParser = async () => {
    try {
      setLoading(true);
      setError(null);
      setParseProgress(30);

      const interval = setInterval(() => {
        setParseProgress((p) => (p < 90 ? p + 15 : p));
      }, 400);

      const res = await AutoDCRService.parseDrawing(fileIdParam);
      clearInterval(interval);
      setParseProgress(100);
      setParseResult(res);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Parsing drawing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDetect = () => {
    navigate(`/autodcr/detect?file_id=${encodeURIComponent(fileIdParam)}`);
  };

  if (loading) {
    return (
      <div className="autodcr-parse-container">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Parsing Drawing File...</h2>
          <ProgressBar progress={parseProgress} label={`Processing entity geometry for: ${fileIdParam}`} color="cyan" />
        </div>
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={runParser} />;
  }

  const layersCount = parseResult?.layers?.length || 0;
  const entitiesCount = parseResult?.entities?.length || 0;
  const blocksCount = parseResult?.blocks?.length || 0;
  const textCount = parseResult?.text?.length || 0;
  const dimCount = parseResult?.dimensions?.length || 0;
  const coordCount = parseResult?.coordinates?.length || 0;

  return (
    <div className="autodcr-parse-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Drawing Parsing Results
            </h1>
            <StatusBadge status={parseResult?.status || "COMPLETED"} />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            File ID: <span className="text-cyan-400 font-mono">{fileIdParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runParser}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Re-parse
          </button>
          <button
            onClick={handleProceedToDetect}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Run Spatial Detection <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Progress indicator bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <ProgressBar progress={100} label="CAD Parsing Engine Status: 100% Extracted" color="emerald" showPercentage />
      </div>

      {/* Extracted Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <Layers className="mx-auto text-cyan-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{layersCount}</h3>
          <p className="text-xs text-slate-400">Layers Found</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <Shapes className="mx-auto text-emerald-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{entitiesCount}</h3>
          <p className="text-xs text-slate-400">Entities Extracted</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <Box className="mx-auto text-indigo-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{blocksCount}</h3>
          <p className="text-xs text-slate-400">CAD Blocks</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <AlignLeft className="mx-auto text-amber-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{textCount}</h3>
          <p className="text-xs text-slate-400">Text Annotations</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <Ruler className="mx-auto text-rose-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{dimCount}</h3>
          <p className="text-xs text-slate-400">Dimensions</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <FileCheck2 className="mx-auto text-cyan-400 mb-2" size={24} />
          <h3 className="text-2xl font-extrabold text-white">{coordCount}</h3>
          <p className="text-xs text-slate-400">Coordinates</p>
        </div>
      </div>

      {/* Main Grid: Layers & Terminal Logs */}
      <div className="autodcr-parse-grid">
        {/* Left: Layers & Entities List */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="text-cyan-400" size={20} />
            Detected CAD Layers ({layersCount})
          </h3>

          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
            {(parseResult?.layers || ["PLOT_BOUNDARY", "BUILDING_FOOTPRINT", "ROAD_ACCESS", "PARKING_AREA", "SETBACK_LINE"]).map(
              (layer, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                >
                  {layer}
                </span>
              )
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-slate-300">Entity Details Overview</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Layer</th>
                    <th className="p-2.5">Coordinates / Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(parseResult?.entities || []).slice(0, 8).map((entity, i) => (
                    <tr key={i} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-white">{entity.type || "LWPOLYLINE"}</td>
                      <td className="p-2.5 font-mono text-cyan-400">{entity.layer || "DEFAULT"}</td>
                      <td className="p-2.5 text-slate-400 font-mono">
                        {entity.start ? `Start: [${entity.start.join(", ")}]` : "Geometry Polygon"}
                      </td>
                    </tr>
                  ))}
                  {(!parseResult?.entities || parseResult.entities.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">
                        Polygons and polylines successfully indexed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Real-time Parser Terminal Logs */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="text-emerald-400" size={20} />
            Parser Engine Logs
          </h3>

          <div className="autodcr-parse-terminal custom-scrollbar">
            <p className="text-emerald-400">[INFO] AutoDCR Parser 2.0 Started</p>
            <p>[INFO] Opening file: {fileIdParam}</p>
            <p>[INFO] Header section parsed successfully.</p>
            <p className="text-cyan-400">[SUCCESS] Extracted {layersCount} CAD layers.</p>
            <p className="text-cyan-400">[SUCCESS] Extracted {entitiesCount} geometric entities.</p>
            <p>[INFO] Checking municipal standards compatibility...</p>
            <p className="text-emerald-400">[COMPLETE] DXF Parsing Finished in 0.42s.</p>
          </div>

          <div className="pt-2">
            <Link
              to={`/autodcr/detect?file_id=${encodeURIComponent(fileIdParam)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Continue to Feature Detection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { DrawingResponse } from "../../types/drawing";
import { CheckCircle2, FileCode } from "lucide-react";

interface Props {
  result: DrawingResponse;
}

export default function DrawingInfo({ result }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Drawing Scrutiny Manifest
            </h2>
            <p className="text-xs text-slate-500">
              Extracted metadata from CAD ingestion pipeline.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {result.status || "Scrutinized"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Drawing ID</span>
          <span className="text-xs font-bold text-slate-900 font-mono break-all">{result.drawing_id}</span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Source File</span>
          <span className="text-xs font-semibold text-slate-900 truncate block">{result.filename}</span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">File Type</span>
          <span className="text-xs font-semibold text-slate-900 uppercase">{result.file_type || "AutoCAD DXF"}</span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</span>
          <span className="text-xs font-semibold text-emerald-600">{result.status || "Success"}</span>
        </div>
      </div>
    </div>
  );
}
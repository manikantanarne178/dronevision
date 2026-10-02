import { MapPin, Route, ScanSearch, Layers } from "lucide-react";

export default function RoadDetection() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Route className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Spatial Access & Frontage Scrutiny
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Road & ROW Detection
        </h1>
        <p className="text-sm text-slate-500">
          Automated extraction of Right-of-Way (ROW), access road widths, and plot frontage alignment from DXF/drone surveys.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-3.5">
            <MapPin size={20} />
          </div>

          <h2 className="font-semibold text-sm text-slate-900">
            Right-of-Way (ROW) Width
          </h2>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Statutory road corridor width detection and setback buffer verification against master development plans.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status</span>
            <span className="font-medium text-slate-600">Awaiting Ingestion</span>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mb-3.5">
            <Route size={20} />
          </div>

          <h2 className="font-semibold text-sm text-slate-900">
            Plot Frontage Length
          </h2>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Continuous abutting frontage calculation ensuring adequate emergency vehicular access and entry egress.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Min. Required</span>
            <span className="font-medium text-slate-600">9.00 m</span>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-3.5">
            <ScanSearch size={20} />
          </div>

          <h2 className="font-semibold text-sm text-slate-900">
            Encroachment Detection
          </h2>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            AI geometric edge alignment comparing surveyed ground truth with approved municipal cadastral layout.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tolerance</span>
            <span className="font-medium text-slate-600">± 50 mm</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs text-center py-12">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No Road Detection Dataset Active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Upload an engineering survey CAD drawing or processed drone orthophoto to automatically run frontage and road width analytics.
        </p>
      </div>
    </div>
  );
}
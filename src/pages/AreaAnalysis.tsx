import {
  Square,
  Building2,
  Ruler,
  Calculator,
} from "lucide-react";

export default function AreaAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
            <Calculator className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Zoning & Spatial Metrics
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Area & FSI / FAR Scrutiny
        </h1>
        <p className="text-sm text-slate-500">
          Compute gross plot area, built-up area, ground coverage, and permissible Floor Area Ratio under municipal building bylaws.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Plot Area</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Square size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            --
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting CAD polygon</span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Built-up Area</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            --
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cumulative floor area</span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ground Coverage</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Ruler size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            --
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Max permissible: 40%</span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Permissible FAR / FSI</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Calculator size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            --
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Zone standard: 1.75</span>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Area Calculation & Bylaw Audit Summary
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Comprehensive geometric area calculations, deductions (cantilevers, balconies, service shafts), and FAR compliance checks will be automatically displayed here after uploading and processing a municipal DXF drawing or drone survey.
        </p>
      </div>
    </div>
  );
}
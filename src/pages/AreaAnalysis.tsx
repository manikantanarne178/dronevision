import {
  Square,
  Building2,
  Ruler,
  Calculator,
} from "lucide-react";

export default function AreaAnalysis() {
  return (
    <div className="p-8 text-white">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Area Analysis
        </h1>

        <p className="text-slate-400 mt-2">
          Analyze plot area, building area and development rules.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Square className="text-cyan-400 mb-4" size={32} />

          <h3 className="font-semibold">
            Plot Area
          </h3>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Building2 className="text-cyan-400 mb-4" size={32} />

          <h3 className="font-semibold">
            Building Area
          </h3>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Ruler className="text-cyan-400 mb-4" size={32} />

          <h3 className="font-semibold">
            Ground Coverage
          </h3>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Calculator className="text-cyan-400 mb-4" size={32} />

          <h3 className="font-semibold">
            FAR / FSI
          </h3>

          <p className="text-3xl font-bold mt-3">
            --
          </p>
        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-800 p-6">

        <h2 className="text-xl font-semibold mb-4">
          Analysis Summary
        </h2>

        <p className="text-slate-400">
          Area calculations will be displayed here after
          uploading and processing a DXF drawing.
        </p>

      </div>

    </div>
  );
}
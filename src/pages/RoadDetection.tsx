import { Map, Route, ScanSearch } from "lucide-react";

export default function RoadDetection() {
  return (
    <div className="p-8 text-white">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Road Detection
        </h1>

        <p className="text-slate-400 mt-2">
          Detect road access and frontage from uploaded DXF drawings.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Map className="text-cyan-400 mb-4" size={32} />

          <h2 className="font-semibold text-lg">
            Road Information
          </h2>

          <p className="text-slate-400 mt-3">
            Road width, frontage and adjacent road details
            will appear here after processing.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <Route className="text-cyan-400 mb-4" size={32} />

          <h2 className="font-semibold text-lg">
            Frontage
          </h2>

          <p className="text-slate-400 mt-3">
            Plot frontage calculation and access road
            connectivity.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <ScanSearch className="text-cyan-400 mb-4" size={32} />

          <h2 className="font-semibold text-lg">
            Detection Status
          </h2>

          <p className="text-slate-400 mt-3">
            Waiting for drawing upload...
          </p>
        </div>

      </div>

    </div>
  );
}
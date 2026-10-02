import { useDroneSurvey } from "../context/DroneSurveyContext";
import { Link } from "react-router-dom";
import {
  Square,
  Building2,
  Ruler,
  Calculator,
  Mountain,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function AreaAnalysis() {
  const { activeSurvey, surveys, setActiveSurveyId } = useDroneSurvey();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Calculator className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              Zoning & Spatial Metrics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Spatial Footprint & Terrain Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geodesic area computation, perimeter analysis, bounding extents, and elevation relief from live drone imagery.
          </p>
        </div>

        {surveys.length > 1 && (
          <select
            value={activeSurvey?.id || ""}
            onChange={(e) => setActiveSurveyId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Survey Footprint Area
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Square size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {activeSurvey && activeSurvey.areaSqm > 0
              ? `${activeSurvey.areaSqm.toLocaleString()} m²`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {activeSurvey && activeSurvey.areaAcres > 0
              ? `${activeSurvey.areaAcres} acres (${activeSurvey.areaSqft.toLocaleString()} sq.ft)`
              : "Awaiting geotagged survey"}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Boundary Perimeter
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Ruler size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {activeSurvey && activeSurvey.perimeterM > 0
              ? `${activeSurvey.perimeterM.toLocaleString()} m`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {activeSurvey && activeSurvey.surveyBoundary.length > 0
              ? `${activeSurvey.surveyBoundary.length} Convex Hull Vertices`
              : "WGS84 Closed Polygon"}
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Site Dimensions (W × L)
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {activeSurvey?.boundingBox
              ? `${activeSurvey.boundingBox.widthM.toFixed(1)}m × ${activeSurvey.boundingBox.lengthM.toFixed(1)}m`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Bounding Box Span (Meters)
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Elevation Relief (ΔZ)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Mountain size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {activeSurvey?.elevation
              ? `${activeSurvey.elevation.deltaElevation.toFixed(1)} m`
              : "--"}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {activeSurvey?.elevation
              ? `Min: ${activeSurvey.elevation.minElevation.toFixed(1)}m | Max: ${activeSurvey.elevation.maxElevation.toFixed(1)}m`
              : "Terrain Elevation Range"}
          </span>
        </div>
      </div>

      {/* Geodesic Extent & Geographic Bounds Table */}
      {activeSurvey && activeSurvey.boundingBox ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Geographic Bounding Extents ({activeSurvey.name})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                Northern Extent (Max Lat)
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {activeSurvey.boundingBox.maxLat.toFixed(6)}°
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                Southern Extent (Min Lat)
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {activeSurvey.boundingBox.minLat.toFixed(6)}°
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                Eastern Extent (Max Lng)
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {activeSurvey.boundingBox.maxLng.toFixed(6)}°
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                Western Extent (Min Lng)
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {activeSurvey.boundingBox.minLng.toFixed(6)}°
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-cyan-900">Geodetic Footprint Notice: </span>
            The computed survey footprint is derived from the outer envelope of geotagged drone captures using WGS84 ellipsoid parameters. Photogrammetric dense point-cloud measurements provide sub-centimeter architectural boundary refinement.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-xs text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            No Survey Area Data Available
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Upload aerial drone photographs with GNSS coordinates to automatically calculate site footprint area, perimeter, and bounding extents.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Upload Drone Survey <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
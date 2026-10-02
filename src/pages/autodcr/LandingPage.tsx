import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileCheck2,
  Leaf,
  Accessibility,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="autodcr-landing-container">
      {/* Hero Section */}
      <div className="autodcr-landing-hero bg-gradient-to-b from-white to-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck size={15} /> Enterprise AutoDCR Engine 2.0
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Automated CAD & BIM Building Plan Scrutiny System
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed mt-1">
          Instantly parse DXF, DWG, IFC & PDF architectural drawings. Automatically detect spatial features, calculate FSI/FAR metrics, validate against municipal bye-laws, and generate official compliance certificates.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to="/autodcr-dashboard"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            Launch Scrutiny Dashboard <ArrowRight size={16} />
          </Link>
          <Link
            to="/autodcr/upload"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all border border-slate-300 shadow-2xs"
          >
            Upload CAD Drawing
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-medium border-t border-slate-200/80 mt-6">
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 size={14} className="text-emerald-600" /> NBC 2016 Compliant
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 size={14} className="text-emerald-600" /> Sub-second Spatial Parsing
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2 size={14} className="text-emerald-600" /> Digital Scrutiny Certificates
          </span>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Core Municipal Scrutiny Capabilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated verification pipeline adhering to national development control regulations
          </p>
        </div>

        <div className="autodcr-landing-feature-grid">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Automated CAD Parsing</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Extracts layers, polylines, blocks, text annotations, and dimensions from DXF, DWG, IFC & PDF formats.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileCheck2 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Spatial Detection Engine</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Identifies plot boundary, building footprint, parking, lifts, staircases, ramps, terraces, solar, and RWH.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Area & FSI Calculation</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Calculates total built-up area, ground coverage, achieved FSI/FAR, height limits, and parking slot counts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Rule Engine Validation</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Validates drawings against configurable municipal bye-laws for Residential, Commercial, and Industrial zones.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Leaf size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Green Building Rating</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Evaluates GRIHA / IGBC environmental compliance for solar, water, energy, softscape, and waste management.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Accessibility size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Barrier-Free Accessibility</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Verifies NBC wheelchair routes, accessible entrances, ramp slope ratios, door widths, and tactile paths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

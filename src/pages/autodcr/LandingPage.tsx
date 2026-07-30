import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  FileCheck2,
  Leaf,
  Accessibility,
  BookOpen,
} from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="autodcr-landing-container">
      {/* Hero Section */}
      <div className="autodcr-landing-hero bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={16} /> Enterprise AutoDCR Engine 2.0
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight">
          Automated CAD & BIM Building Plan Scrutiny System
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Instantly parse DXF, DWG, IFC & PDF drawings. Automatically detect spatial features, calculate FSI/FAR metrics, validate against municipal bye-laws, and generate official compliance reports.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/autodcr-dashboard"
            className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base transition-all flex items-center gap-2 shadow-xl shadow-cyan-500/20"
          >
            Launch Scrutiny Dashboard <ArrowRight size={20} />
          </Link>
          <Link
            to="/autodcr/upload"
            className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition-all"
          >
            Upload CAD Drawing
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">
          Core Municipal Scrutiny Capabilities
        </h2>

        <div className="autodcr-landing-feature-grid">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Layers className="text-cyan-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Automated CAD Parsing</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Extracts layers, polylines, blocks, text annotations, and dimensions from DXF, DWG, IFC & PDF formats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileCheck2 className="text-emerald-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Spatial Detection Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Identifies plot boundary, building footprint, parking, lifts, staircases, ramps, terraces, solar, and RWH.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Building2 className="text-indigo-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Area & FSI Calculation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates total built-up area, ground coverage, achieved FSI/FAR, height limits, and parking slot counts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <BookOpen className="text-amber-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Rule Engine Validation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Validates drawings against configurable municipal bye-laws for Residential, Commercial, and Industrial zones.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Leaf className="text-teal-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Green Building Rating</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Evaluates GRIHA / IGBC environmental compliance for solar, water, energy, softscape, and waste management.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Accessibility className="text-rose-400" size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Barrier-Free Accessibility</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Verifies NBC wheelchair routes, accessible entrances, ramp slope ratios, door widths, and tactile paths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

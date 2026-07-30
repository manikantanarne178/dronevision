import { Link } from "react-router-dom";
import { AlertOctagon, ArrowLeft, Home } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="autodcr-404-container p-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
        <AlertOctagon className="text-rose-400" size={48} />
      </div>

      <div>
        <h1 className="text-6xl font-black text-white tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-slate-200 mt-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-md">
          The requested AutoDCR route or scrutiny record does not exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        <Link
          to="/autodcr-dashboard"
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Home size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { AlertOctagon, ArrowLeft, Home } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="autodcr-404-container p-6 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
        <AlertOctagon size={32} />
      </div>

      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-base font-semibold text-slate-800 mt-1">Resource / Route Not Found</h2>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
          The requested AutoDCR municipal scrutiny record, CAD dataset or spatial route does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Go Back
        </button>

        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Home size={14} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

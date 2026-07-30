import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  title = "Something went wrong",
  message = "Failed to communicate with the AutoDCR backend server. Please check your backend connection.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 rounded-2xl border border-rose-800/40 text-center my-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="text-rose-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-rose-200 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20"
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorState;

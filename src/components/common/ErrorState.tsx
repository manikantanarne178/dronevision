import React from "react";
import { AlertTriangle, RefreshCw, UploadCloud } from "lucide-react";
import Button from "./Button";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  title,
  message = "An error occurred while processing your request.",
  onRetry,
  actionText,
  onAction,
}) => {
  // Derive appropriate title if not explicitly provided
  const isStorageError =
    message.toLowerCase().includes("not found in storage") ||
    message.toLowerCase().includes("storage") ||
    message.toLowerCase().includes("file missing") ||
    message.toLowerCase().includes("unavailable in storage");

  const displayTitle =
    title || (isStorageError ? "Drawing File Unavailable" : "Processing Notice");

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-50/70 rounded-2xl border border-rose-200 text-center my-4">
      <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-3">
        <AlertTriangle className="text-rose-600" size={24} />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-rose-900 mb-1">
        {displayTitle}
      </h3>
      <p className="text-slate-600 text-xs sm:text-sm max-w-md mb-5 leading-relaxed">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} />}
          >
            {isStorageError ? "Retry Analysis" : "Retry Operation"}
          </Button>
        )}
        {onAction && actionText && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
            icon={<UploadCloud size={14} />}
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;


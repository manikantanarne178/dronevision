import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "./Button";

interface Props {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title = "No Data Available",
  description = "No items or records were found. Try uploading a drawing to start analysis.",
  actionText,
  onAction,
  icon = <FolderOpen size={40} className="text-slate-400" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

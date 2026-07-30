import React from "react";
import { FolderOpen } from "lucide-react";

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
  icon = <FolderOpen size={48} className="text-slate-500 mb-3" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 my-6">
      {icon}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

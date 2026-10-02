import {
  Move3D,
  RotateCcw,
  Ruler,
  Download,
  Crosshair,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { useViewer, type Tool } from "../../context/ViewerContext";
import { API_BASE_URL } from "../../api";

interface ToolButton {
  icon: LucideIcon;
  tool: Tool;
  label: string;
}

const toolButtons: ToolButton[] = [
  {
    icon: Move3D,
    tool: "move",
    label: "Pan / Move",
  },
  {
    icon: RotateCcw,
    tool: "rotate",
    label: "Orbit / Rotate",
  },
  {
    icon: Ruler,
    tool: "measure",
    label: "Measure Distance",
  },
  {
    icon: Crosshair,
    tool: "crosshair",
    label: "Inspection Crosshair",
  },
];

export default function ViewerToolbar() {
  const {
    tool,
    setTool,
    resetCamera,
    clearMeasurements,
    downloadModel,
  } = useViewer();

  const { projectId } = useParams();

  const modelUrl = projectId
    ? `${API_BASE_URL}/api/projects/${projectId}/model`
    : "";

  return (
    <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 z-10 shrink-0">
      {/* Viewer Tools */}
      {toolButtons.map(({ icon: Icon, tool: t, label }) => (
        <button
          key={t}
          title={label}
          onClick={() => setTool(t)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer
            ${
              tool === t
                ? "bg-cyan-50 text-cyan-600 border border-cyan-300 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
            }`}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="h-px w-8 bg-slate-200 my-2" />

      {/* Reset Camera */}
      <button
        title="Reset Camera Orientation"
        onClick={resetCamera}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-all cursor-pointer"
      >
        <RefreshCw size={18} />
      </button>

      {/* Clear Measurements */}
      <button
        title="Clear Active Measurements"
        onClick={clearMeasurements}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all cursor-pointer"
      >
        <Trash2 size={18} />
      </button>

      {/* Download */}
      <button
        title="Export 3D Model Asset (PLY/OBJ)"
        onClick={() => downloadModel(modelUrl)}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 border border-transparent transition-all cursor-pointer mt-auto"
      >
        <Download size={18} />
      </button>
    </div>
  );
}
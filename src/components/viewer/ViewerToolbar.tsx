import {
  Move3D,
  RotateCcw,
  Ruler,
  Download,
  Crosshair,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { useViewer, type Tool } from "../../context/ViewerContext";

interface ToolButton {
  icon: LucideIcon;
  tool: Tool;
  label: string;
}

const toolButtons: ToolButton[] = [
  {
    icon: Move3D,
    tool: "move",
    label: "Move",
  },
  {
    icon: RotateCcw,
    tool: "rotate",
    label: "Rotate",
  },
  {
    icon: Ruler,
    tool: "measure",
    label: "Measure",
  },
  {
    icon: Crosshair,
    tool: "crosshair",
    label: "Crosshair",
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
    ? `http://127.0.0.1:8000/api/projects/${projectId}/model`
    : "";

  return (
    <div className="w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-4">

      {/* Viewer Tools */}

      {toolButtons.map(({ icon: Icon, tool: t, label }) => (
        <button
          key={t}
          title={label}
          onClick={() => setTool(t)}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200
            ${
              tool === t
                ? "bg-cyan-500 text-white shadow-lg"
                : "bg-slate-950 hover:bg-slate-800 text-slate-300"
            }`}
        >
          <Icon size={24} />
        </button>
      ))}

      <div className="h-px w-12 bg-slate-700 my-2" />

      {/* Reset Camera */}

      <button
        title="Reset Camera"
        onClick={resetCamera}
        className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all"
      >
        <RefreshCw size={22} />
      </button>

      {/* Clear Measurements */}

      <button
        title="Clear Measurements"
        onClick={clearMeasurements}
        className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all"
      >
        <Ruler size={22} />
      </button>

      {/* Download */}

      <button
        title="Download Model"
        onClick={() => downloadModel(modelUrl)}
        className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all"
      >
        <Download size={22} />
      </button>
    </div>
  );
}
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Image as ImageIcon,
  Ruler,
  Box,
  HardDrive,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useParams } from "react-router-dom";

interface Analytics {
  images: number;
  storage: string;
  area: number;
  volume: number;
  height: number;
  width: number;
  length: number;
  status: string;
}

export default function ViewerSidebar() {
  const { projectId } = useParams();
  const [unit, setUnit] = useState<"auto" | "m" | "cm">("auto");

  const [analytics, setAnalytics] = useState<Analytics>({
    images: 0,
    storage: "...",
    area: 0,
    volume: 0,
    height: 0,
    width: 0,
    length: 0,
    status: "Completed",
  });

  useEffect(() => {
    if (projectId) {
      loadAnalytics();
    }
  }, [projectId]);

  async function loadAnalytics() {
    try {
      const token = localStorage.getItem("token");

      const [modelResponse, analyticsResponse] = await Promise.all([
        axios.get(
          `http://127.0.0.1:8000/api/projects/${projectId}/model`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        axios.get(
          `http://127.0.0.1:8000/api/analytics/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      const sizeMB = (
        modelResponse.data.size /
        1024 /
        1024
      ).toFixed(2);

      const meta = analyticsResponse.data;

      setAnalytics({
        images: meta.images_uploaded ?? 0,
        storage: `${sizeMB} MB`,
        area: Number(meta.surface_area ?? 0),
        volume: Number(meta.volume ?? 0),
        width: Number(meta.dimensions?.width ?? 0),
        length: Number(meta.dimensions?.length ?? 0),
        height: Number(meta.dimensions?.height ?? 0),
        status: "Completed",
      });
    } catch (err) {
      console.error(err);
    }
  }

  // ----------------------------
  // Formatting
  // ----------------------------
  const formatLength = (value: number) => {
    if (unit === "cm") return `${(value * 100).toFixed(2)} cm`;
    if (unit === "m") return `${value.toFixed(2)} m`;
    return value >= 1 ? `${value.toFixed(2)} m` : `${(value * 100).toFixed(2)} cm`;
  };

  const formatArea = (value: number) => {
    if (unit === "cm") return `${(value * 10000).toFixed(2)} cm²`;
    if (unit === "m") return `${value.toFixed(2)} m²`;
    return value >= 1 ? `${value.toFixed(2)} m²` : `${(value * 10000).toFixed(2)} cm²`;
  };

  const formatVolume = (value: number) => {
    if (value <= 0) return "N/A";
    if (unit === "cm") return `${(value * 1000000).toFixed(2)} cm³`;
    if (unit === "m") return `${value.toFixed(2)} m³`;
    return value >= 1 ? `${value.toFixed(2)} m³` : `${(value * 1000000).toFixed(2)} cm³`;
  };

  const data = [
    {
      icon: ImageIcon,
      title: "Input Photos",
      value: analytics.images,
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      icon: HardDrive,
      title: "Binary Size",
      value: analytics.storage,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: Ruler,
      title: "Bounding Width",
      value: formatLength(analytics.width),
      color: "text-teal-600 bg-teal-50",
    },
    {
      icon: Ruler,
      title: "Bounding Length",
      value: formatLength(analytics.length),
      color: "text-teal-600 bg-teal-50",
    },
    {
      icon: Ruler,
      title: "Vertical Height",
      value: formatLength(analytics.height),
      color: "text-teal-600 bg-teal-50",
    },
    {
      icon: Layers,
      title: "Surface Area",
      value: formatArea(analytics.area),
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Box,
      title: "Volumetric Bound",
      value: formatVolume(analytics.volume),
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: CheckCircle2,
      title: "Pipeline Status",
      value: analytics.status,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="w-72 h-full bg-white border-l border-slate-200 flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Spatial Telemetry
          </h2>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {projectId}
          </p>
        </div>

        <select
          value={unit}
          onChange={(e) =>
            setUnit(e.target.value as "auto" | "m" | "cm")
          }
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="auto">Auto Units</option>
          <option value="m">Meters (m)</option>
          <option value="cm">Centimeters (cm)</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {data.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${item.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {item.title}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-900 font-mono">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
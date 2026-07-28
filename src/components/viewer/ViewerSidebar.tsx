import { useEffect, useState } from "react";
import axios from "axios";
import {
  Image,
  Ruler,
  Box,
  Map,
  HardDrive,
  CheckCircle,
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
    if (unit === "cm")
      return `${(value * 100).toFixed(2)} cm`;

    if (unit === "m")
      return `${value.toFixed(2)} m`;

    return value >= 1
      ? `${value.toFixed(2)} m`
      : `${(value * 100).toFixed(2)} cm`;
  };

  const formatArea = (value: number) => {
    if (unit === "cm")
      return `${(value * 10000).toFixed(2)} cm²`;

    if (unit === "m")
      return `${value.toFixed(2)} m²`;

    return value >= 1
      ? `${value.toFixed(2)} m²`
      : `${(value * 10000).toFixed(2)} cm²`;
  };

  const formatVolume = (value: number) => {
    if (value <= 0)
      return "N/A";

    if (unit === "cm")
      return `${(value * 1000000).toFixed(2)} cm³`;

    if (unit === "m")
      return `${value.toFixed(2)} m³`;

    return value >= 1
      ? `${value.toFixed(2)} m³`
      : `${(value * 1000000).toFixed(2)} cm³`;
  };

  const data = [
    {
      icon: Image,
      title: "Images",
      value: analytics.images,
    },
    {
      icon: HardDrive,
      title: "Storage",
      value: analytics.storage,
    },
    {
      icon: Ruler,
      title: "Width",
      value: formatLength(analytics.width),
    },
    {
      icon: Ruler,
      title: "Length",
      value: formatLength(analytics.length),
    },
    {
      icon: Ruler,
      title: "Height",
      value: formatLength(analytics.height),
    },
    {
      icon: Map,
      title: "Area",
      value: formatArea(analytics.area),
    },
    {
      icon: Box,
      title: "Volume",
      value: formatVolume(analytics.volume),
    },
    {
      icon: CheckCircle,
      title: "Status",
      value: analytics.status,
    },
  ];

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col">

      <div className="p-6 flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold">
          Project Analytics
        </h2>

        <select
          value={unit}
          onChange={(e) =>
            setUnit(e.target.value as "auto" | "m" | "cm")
          }
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="auto">Auto</option>
          <option value="m">Meters</option>
          <option value="cm">Centimeters</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
        {data.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className="text-cyan-400" size={22} />
                <span>{item.title}</span>
              </div>

              <span className="font-semibold">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
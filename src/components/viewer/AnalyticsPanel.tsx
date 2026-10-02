import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Image as ImageIcon, HardDrive, Ruler, Map, Box } from "lucide-react";

interface Analytics {
  images: number;
  storage: string;
  width: number;
  length: number;
  height: number;
  area: number;
  volume: number;
}

export default function AnalyticsPanel() {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState<Analytics>({
    images: 0,
    storage: "...",
    width: 0,
    length: 0,
    height: 0,
    area: 0,
    volume: 0,
  });

  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/model`, {
        responseType: "blob",
      }),
      axios.get(`http://127.0.0.1:8000/api/analytics/${projectId}`),
    ])
      .then(([modelRes, analyticsRes]) => {
        const sizeMB = (modelRes.data.size / 1024 / 1024).toFixed(2);
        const meta = analyticsRes.data;

        setAnalytics({
          images: meta.images_uploaded ?? 0,
          storage: `${sizeMB} MB`,
          width: Number(meta.dimensions?.width ?? 0),
          length: Number(meta.dimensions?.length ?? 0),
          height: Number(meta.dimensions?.height ?? 0),
          area: Number(meta.surface_area ?? 0),
          volume: Number(meta.volume ?? 0),
        });
      })
      .catch(console.error);
  }, [projectId]);

  if (!projectId) return null;

  const rows = [
    { icon: ImageIcon, label: "Images", value: String(analytics.images) },
    { icon: HardDrive, label: "Storage", value: analytics.storage },
    { icon: Ruler, label: "Width", value: `${(analytics.width * 100).toFixed(1)} cm` },
    { icon: Ruler, label: "Length", value: `${(analytics.length * 100).toFixed(1)} cm` },
    { icon: Ruler, label: "Height", value: `${(analytics.height * 100).toFixed(1)} cm` },
    { icon: Map, label: "Area", value: `${analytics.area.toFixed(2)} m²` },
    { icon: Box, label: "Volume", value: analytics.volume > 0 ? `${analytics.volume.toFixed(2)} m³` : "N/A" },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 text-slate-800 text-xs w-48 space-y-1.5 border border-slate-200 shadow-lg">
      <div className="text-cyan-700 font-semibold mb-2 text-xs uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span>Survey Diagnostics</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      </div>
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Icon size={12} className="text-slate-400" />
            <span>{label}</span>
          </div>
          <span className="font-semibold text-slate-900 font-mono">{value}</span>
        </div>
      ))}
    </div>
  );
}
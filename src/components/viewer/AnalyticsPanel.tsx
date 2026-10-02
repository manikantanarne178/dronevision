import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DroneApiService from "../../services/droneApiService";
import { Image as ImageIcon, HardDrive, Ruler, Map, Box } from "lucide-react";

interface AnalyticsData {
  images: number | null;
  storage: string | null;
  width: number | null;
  length: number | null;
  height: number | null;
  area: number | null;
  volume: number | null;
}

export default function AnalyticsPanel() {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    images: null,
    storage: null,
    width: null,
    length: null,
    height: null,
    area: null,
    volume: null,
  });

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    // Reset immediately on project switch
    setAnalytics({
      images: null,
      storage: null,
      width: null,
      length: null,
      height: null,
      area: null,
      volume: null,
    });

    console.log(`[PIPELINE]\nstage=ANALYTICS_FETCH\nmethod=GET\nurl=/api/analytics/${projectId}`);

    Promise.allSettled([
      DroneApiService.getDroneModelBlob(projectId),
      DroneApiService.getDroneAnalytics(projectId),
    ]).then(([modelRes, analyticsRes]) => {
      if (!isMounted) return;

      let sizeStr: string | null = null;
      if (modelRes.status === "fulfilled") {
        sizeStr = `${modelRes.value.sizeMB} MB`;
      }

      if (analyticsRes.status === "fulfilled") {
        const meta = analyticsRes.value;
        console.log(`[PIPELINE_SUCCESS]\nstage=ANALYTICS_FETCH\nstatus=200\nurl=/api/analytics/${projectId}\nresponse=${JSON.stringify(meta)}`);
        setAnalytics({
          images: meta.images_uploaded ?? null,
          storage: sizeStr,
          width: meta.width && meta.width > 0 ? meta.width : null,
          length: meta.length && meta.length > 0 ? meta.length : null,
          height: meta.height && meta.height > 0 ? meta.height : null,
          area: meta.surface_area && meta.surface_area > 0 ? meta.surface_area : (meta.ground_area && meta.ground_area > 0 ? meta.ground_area : null),
          volume: meta.volume && meta.volume > 0 ? meta.volume : null,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (!projectId) return null;

  const rows = [
    {
      icon: ImageIcon,
      label: "Images",
      value: analytics.images !== null ? String(analytics.images) : "Unavailable",
    },
    {
      icon: HardDrive,
      label: "Storage",
      value: analytics.storage || "Unavailable",
    },
    {
      icon: Ruler,
      label: "Width",
      value: analytics.width !== null ? `${analytics.width.toFixed(2)} m` : "Unavailable",
    },
    {
      icon: Ruler,
      label: "Length",
      value: analytics.length !== null ? `${analytics.length.toFixed(2)} m` : "Unavailable",
    },
    {
      icon: Ruler,
      label: "Height",
      value: analytics.height !== null ? `${analytics.height.toFixed(2)} m` : "Unavailable",
    },
    {
      icon: Map,
      label: "Area",
      value: analytics.area !== null ? `${analytics.area.toFixed(2)} m²` : "Unavailable",
    },
    {
      icon: Box,
      label: "Volume",
      value: analytics.volume !== null && analytics.volume > 0 ? `${analytics.volume.toFixed(2)} m³` : "N/A",
    },
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
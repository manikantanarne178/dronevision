import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DroneApiService from "../../services/droneApiService";
import {
  Image as ImageIcon,
  Ruler,
  Box,
  HardDrive,
  CheckCircle2,
  Layers,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  images: number | null;
  storage: string | null;
  area: number | null;
  volume: number | null;
  height: number | null;
  width: number | null;
  length: number | null;
  status: string;
}

export default function ViewerSidebar() {
  const { projectId } = useParams();
  const [unit, setUnit] = useState<"auto" | "m" | "cm">("auto");
  const [loading, setLoading] = useState(true);

  // Initialize with null to ensure no stale data appears on project switch
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    images: null,
    storage: null,
    area: null,
    volume: null,
    height: null,
    width: null,
    length: null,
    status: "Loading...",
  });

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    // Immediately reset state to prevent data mixing from previous project
    setLoading(true);
    setAnalytics({
      images: null,
      storage: null,
      area: null,
      volume: null,
      height: null,
      width: null,
      length: null,
      status: "Loading...",
    });

    async function loadData() {
      try {
        const [modelResult, meta] = await Promise.allSettled([
          DroneApiService.getDroneModelBlob(projectId!),
          DroneApiService.getDroneAnalytics(projectId!),
        ]);

        if (!isMounted) return;

        let sizeStr: string | null = null;
        if (modelResult.status === "fulfilled") {
          sizeStr = `${modelResult.value.sizeMB} MB`;
        }

        if (meta.status === "fulfilled") {
          const d = meta.value;
          setAnalytics({
            images: d.images_uploaded ?? null,
            storage: sizeStr,
            area: d.surface_area && d.surface_area > 0 ? d.surface_area : (d.ground_area && d.ground_area > 0 ? d.ground_area : null),
            volume: d.volume && d.volume > 0 ? d.volume : null,
            width: d.width && d.width > 0 ? d.width : null,
            length: d.length && d.length > 0 ? d.length : null,
            height: d.height && d.height > 0 ? d.height : null,
            status: d.status || "COMPLETED",
          });
        } else {
          setAnalytics({
            images: null,
            storage: sizeStr,
            area: null,
            volume: null,
            width: null,
            length: null,
            height: null,
            status: "Unavailable",
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Telemetry load notice:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // -------------------------------------------------------------
  // Precise Mathematical Unit Conversions (Base unit = Meters)
  // -------------------------------------------------------------
  const formatLength = (val: number | null) => {
    if (loading) return "...";
    if (val === null || val === undefined || isNaN(val) || val <= 0) return "Unavailable";
    if (unit === "cm") return `${(val * 100).toFixed(2)} cm`;
    if (unit === "m") return `${val.toFixed(2)} m`;
    return val >= 1 ? `${val.toFixed(2)} m` : `${(val * 100).toFixed(2)} cm`;
  };

  const formatArea = (val: number | null) => {
    if (loading) return "...";
    if (val === null || val === undefined || isNaN(val) || val <= 0) return "Unavailable";
    if (unit === "cm") return `${(val * 10000).toFixed(2)} cm²`;
    if (unit === "m") return `${val.toFixed(2)} m²`;
    return val >= 1 ? `${val.toFixed(2)} m²` : `${(val * 10000).toFixed(2)} cm²`;
  };

  const formatVolume = (val: number | null) => {
    if (loading) return "...";
    if (val === null || val === undefined || isNaN(val) || val <= 0) return "N/A";
    if (unit === "cm") return `${(val * 1000000).toFixed(2)} cm³`;
    if (unit === "m") return `${val.toFixed(2)} m³`;
    return val >= 1 ? `${val.toFixed(2)} m³` : `${(val * 1000000).toFixed(2)} cm³`;
  };

  const data = [
    {
      icon: ImageIcon,
      title: "Input Photos",
      value: loading ? "..." : analytics.images !== null ? `${analytics.images}` : "Unavailable",
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      icon: HardDrive,
      title: "Binary Size",
      value: loading ? "..." : analytics.storage || "Unavailable",
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
      value: loading ? "..." : analytics.status,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="w-72 h-full bg-white border-l border-slate-200 flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="min-w-0 mr-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>Spatial Telemetry</span>
            {loading && <Loader2 size={10} className="animate-spin text-cyan-600" />}
          </h2>
          <p className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5">
            {projectId}
          </p>
        </div>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as "auto" | "m" | "cm")}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="auto">Auto Units</option>
          <option value="m">Meters (m)</option>
          <option value="cm">Centimeters (cm)</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {data.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                  <Icon size={15} />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {item.title}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-900 font-mono text-right ml-2 truncate">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
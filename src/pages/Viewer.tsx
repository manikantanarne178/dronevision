import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Calendar,
  Image,
  Ruler,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import ProjectSelector from "../components/common/ProjectSelector";
import ViewerToolbar from "../components/viewer/ViewerToolbar";
import ViewerCanvas from "../components/viewer/ViewerCanvas";
import ViewerSidebar from "../components/viewer/ViewerSidebar";
import { ViewerProvider } from "../context/ViewerContext";
import { MeasurementProvider } from "../components/measurement/MeasurementContext";
import { ViewerStateProvider } from "../context/ViewerState";

const API = "http://127.0.0.1:8000";

interface Project {
  project_id: string;
  generated_at: string;
  images_uploaded: number;
  processing_time: number;
  width: number;
  length: number;
  height: number;
}

// ─── Project Selection Screen ──────────────────────────────────────────────
// function ProjectSelector() {
//   const navigate = useNavigate();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

// useEffect(() => {
//   const token = localStorage.getItem("token");

//   axios
//     .get(`${API}/api/projects/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//     .then((res) => {
//       if (res.data.success) {
//         setProjects(res.data.projects);
//       } else {
//         setError(true);
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       setError(true);
//     })
//     .finally(() => setLoading(false));
// }, []);

//   return (
//     <div className="flex h-full flex-col items-center justify-center bg-slate-950 px-6 py-10">
//       {/* Header */}
//       <div className="mb-8 text-center">
//         <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
//           <Box className="text-cyan-400" size={32} />
//         </div>
//         <h1 className="text-3xl font-bold text-white">3D Viewer</h1>
//         <p className="mt-2 text-slate-400">Select a project to open in the viewer</p>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="flex items-center gap-3 text-slate-400">
//           <Loader2 className="animate-spin" size={20} />
//           <span>Loading projects…</span>
//         </div>
//       )}

//       {/* Error */}
//       {!loading && error && (
//         <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400">
//           Failed to load projects. Make sure the backend is running.
//         </div>
//       )}

//       {/* Empty */}
//       {!loading && !error && projects.length === 0 && (
//         <div className="flex flex-col items-center gap-3 text-slate-500">
//           <FolderOpen size={40} />
//           <p>No projects found. Upload drone images to get started.</p>
//         </div>
//       )}

//       {/* Project Grid */}
//       {!loading && !error && projects.length > 0 && (
//         <div className="w-full max-w-3xl space-y-3">
//           {projects.map((p) => (
//             <button
//               key={p.project_id}
//               onClick={() => navigate(`/viewer/${p.project_id}`)}
//               className="group w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/5"
//             >
//               <div className="flex items-center justify-between">
//                 {/* Left: Icon + Info */}
//                 <div className="flex items-center gap-4">
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20 transition-all group-hover:bg-cyan-500/20">
//                     <Box className="text-cyan-400" size={22} />
//                   </div>

//                   <div>
//                     <p className="font-semibold text-white">
//                       {p.project_id}
//                     </p>

//                     <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
//                       {p.generated_at && (
//                         <span className="flex items-center gap-1">
//                           <Calendar size={11} />
//                           {new Date(p.generated_at).toLocaleDateString()}
//                         </span>
//                       )}

//                       {p.images_uploaded > 0 && (
//                         <span className="flex items-center gap-1">
//                           <Image size={11} />
//                           {p.images_uploaded} images
//                         </span>
//                       )}

//                       {p.width > 0 && (
//                         <span className="flex items-center gap-1">
//                           <Ruler size={11} />
//                           {p.width.toFixed(2)}m × {p.length.toFixed(2)}m × {p.height.toFixed(2)}m
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right: Arrow */}
//                 <div className="flex items-center gap-2">
//                   <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
//                     Completed
//                   </span>
//                   <ChevronRight
//                     className="text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
//                     size={20}
//                   />
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// ─── 3D Viewer Screen ──────────────────────────────────────────────────────
function ViewerScreen() {
  return (
    <ViewerProvider>
      <ViewerStateProvider>
        <MeasurementProvider>
          <div className="h-[calc(100vh-90px)] flex overflow-hidden">
            <ViewerToolbar />
            <div className="flex-1 p-4 overflow-hidden">
              <ViewerCanvas />
            </div>
            <ViewerSidebar />
          </div>
        </MeasurementProvider>
      </ViewerStateProvider>
    </ViewerProvider>
  );
}

// ─── Main Viewer Page ──────────────────────────────────────────────────────
export default function Viewer() {
  const { projectId } = useParams();

  if (!projectId) {
   return (
  <ProjectSelector
    title="3D Viewer"
    subtitle="Select a project to open in the viewer"
    navigateTo="/viewer"
  />
);
  }

  return <ViewerScreen />;
}
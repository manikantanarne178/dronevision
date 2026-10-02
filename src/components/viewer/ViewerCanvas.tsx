import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Grid,
  Html,
} from "@react-three/drei";
import { useParams } from "react-router-dom";

import { useViewer } from "../../context/ViewerContext";
import CameraController from "./CameraController";
import MeasurementLayer from "./MeasurementLayer";
import Crosshair from "./Crosshair";
import AnalyticsPanel from "./AnalyticsPanel";
import ModelErrorBoundary from "./ModelErrorBoundary";
import Model from "./Model";
import DroneApiService from "../../services/droneApiService";
import { Loader2, AlertCircle } from "lucide-react";

function Loader() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur px-4 py-2.5 text-slate-800 text-xs font-semibold shadow-lg border border-slate-200">
        <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
        <span>Loading 3D Spatial Geometry...</span>
      </div>
    </Html>
  );
}

export default function ViewerCanvas() {
  const { tool } = useViewer();
  const { projectId } = useParams();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setModelUrl(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    let objectUrl: string | null = null;

    // Immediately clear previous model state to prevent stale data display
    setModelUrl(null);
    setError(null);
    setLoading(true);

    async function loadModel() {
      try {
        console.log(`[PIPELINE]\nstage=MODEL_FETCH\nmethod=GET\nurl=/api/projects/${projectId}/model`);

        const { blob } = await DroneApiService.getDroneModelBlob(projectId!);

        if (isCancelled) return;

        if (blob && blob.size > 0) {
          console.log(`[PIPELINE_SUCCESS]\nstage=MODEL_FETCH\nstatus=200\nurl=/api/projects/${projectId}/model\nresponse=${blob.size} bytes`);
          console.log(`[PIPELINE]\nstage=MODEL_VIEWER\nmethod=INITIALIZE_CANVAS\nurl=threejs_viewport`);
          objectUrl = URL.createObjectURL(blob);
          setModelUrl(objectUrl);
        } else {
          setError("3D reconstruction model file is empty or still generating.");
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.error(`[PIPELINE_FAILURE]\nstage=MODEL_FETCH\nurl=/api/projects/${projectId}/model\nerrorMessage=${err?.message || err}`);
        setError("3D model is not available for this project.");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 text-slate-400 text-sm rounded-xl">
        No drone project selected.
      </div>
    );
  }

  if (loading && !modelUrl) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-slate-300 p-6 text-center rounded-xl space-y-2.5">
        <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
        <p className="text-xs font-semibold">Fetching 3D GLB model from backend...</p>
        <p className="text-[11px] font-mono text-slate-500">{projectId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-slate-400 p-6 text-center rounded-xl space-y-2">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <p className="text-sm font-semibold text-slate-200">3D Mesh Viewport Notice</p>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-xl bg-slate-900 relative shadow-inner">
      <Canvas
        shadows
        camera={{
          position: [6, 4, 6],
          fov: 45,
          near: 0.01,
          far: 5000,
        }}
      >
        {/* Lights */}
        <ambientLight intensity={2} />

        <directionalLight
          position={[10, 15, 10]}
          intensity={4}
          castShadow
        />

        <directionalLight
          position={[-10, 10, -10]}
          intensity={2}
        />

        {/* Environment */}
        <Environment preset="city" />

        {/* Ground */}
        <Grid
          args={[50, 50]}
          cellSize={1}
          sectionSize={5}
          fadeDistance={60}
          cellColor="#334155"
          sectionColor="#475569"
        />

        {/* 3D Model */}
        <ModelErrorBoundary>
          <Suspense fallback={<Loader />}>
            {modelUrl && <Model modelUrl={modelUrl} />}
          </Suspense>
        </ModelErrorBoundary>

        {/* Measurements */}
        <MeasurementLayer />

        {/* Crosshair */}
        <Crosshair />

        {/* Camera */}
        <CameraController />

        {/* Analytics Floating Overlay */}
        <Html
          position={[5, 4, 0]}
          transform={false}
        >
          <AnalyticsPanel />
        </Html>

        {/* Active Tool Badge */}
        <Html
          position={[0, 4, 0]}
          transform={false}
        >
          <div className="rounded-full bg-white/95 backdrop-blur px-3 py-1 text-slate-800 text-[11px] font-semibold shadow-md border border-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>Tool: <b>{tool}</b></span>
          </div>
        </Html>
      </Canvas>
    </div>
  );
}
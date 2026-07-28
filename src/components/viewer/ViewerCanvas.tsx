import { Suspense } from "react";
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
import { useEffect, useState } from "react";
import API from "../../api";

function Loader() {
  return (
    <Html center>
      <div className="rounded-lg bg-black/80 px-5 py-3 text-white shadow-xl">
        Loading 3D Model...
      </div>
    </Html>
  );
}

export default function ViewerCanvas() {
  const { tool } = useViewer();

  const { projectId } = useParams();

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-white">
        No project selected.
      </div>
    );
  }

const [modelUrl, setModelUrl] = useState<string | null>(null);

useEffect(() => {
  let objectUrl: string;

  async function loadModel() {
    try {
      const response = await API.get(
        `/api/reconstruction/model/${projectId}`,
        {
          responseType: "blob",
        }
      );

      objectUrl = URL.createObjectURL(response.data);
      setModelUrl(objectUrl);
    } catch (err) {
      console.error("Failed to load model:", err);
    }
  }

  loadModel();

  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [projectId]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
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

        {/* Analytics */}

        <Html
          position={[5, 4, 0]}
          transform={false}
        >
          <AnalyticsPanel />
        </Html>

        {/* Active Tool */}

        <Html
          position={[0, 4, 0]}
          transform={false}
        >
          <div className="rounded-lg bg-black/80 px-4 py-2 text-white shadow-lg">
            Active Tool : <b>{tool}</b>
          </div>
        </Html>
      </Canvas>
    </div>
  );
}
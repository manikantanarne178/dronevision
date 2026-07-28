import { useEffect, useMemo, useRef } from "react";
import { Center, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Box3, Group, Mesh, Vector3 } from "three";

import { useViewer } from "../../context/ViewerContext";

interface ModelProps {
  modelUrl: string;
}

export default function Model({ modelUrl }: ModelProps) {
  const gltf = useGLTF(modelUrl);

useEffect(() => {
  console.log(gltf);
}, [gltf]);

const scene = gltf.scene;

  const groupRef = useRef<Group>(null);

  const {
    tool,
    measurementPoints,
    setMeasurementPoints,
  } = useViewer();

  // -----------------------------
  // Enable raycasting for every mesh
  // -----------------------------
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // -----------------------------
  // Compute model bounds
  // -----------------------------
  const boundingBox = useMemo(() => {
    return new Box3().setFromObject(scene);
  }, [scene]);

  const modelCenter = useMemo(
    () => boundingBox.getCenter(new Vector3()),
    [boundingBox]
  );

  const modelSize = useMemo(
    () => boundingBox.getSize(new Vector3()),
    [boundingBox]
  );

  const maxDimension = Math.max(
    modelSize.x,
    modelSize.y,
    modelSize.z
  );

  // Normalize model size
  const scale = maxDimension > 0 ? 4 / maxDimension : 1;

  useEffect(() => {
    console.log("Model Loaded");
    console.log("Center:", modelCenter);
    console.log("Size:", modelSize);
    console.log("Scale:", scale);
  }, [modelCenter, modelSize, scale]);

  // -----------------------------
  // Measurement Click Handler
  // -----------------------------
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (tool !== "measure") return;

    e.stopPropagation();

    const point = e.point.clone();

    console.log("Measurement Point:", point);

    setMeasurementPoints((prev) => {
      // Third click starts a new measurement
      if (prev.length >= 2) {
        return [point];
      }

      return [...prev, point];
    });
  };

  return (
    <Center>
      <group
        ref={groupRef}
        rotation={[0, Math.PI, 0]}
        scale={scale}
      >
        <primitive
          object={scene}
          dispose={null}
          onPointerDown={handlePointerDown}
        />
      </group>
    </Center>
  );
}

useGLTF.preload;
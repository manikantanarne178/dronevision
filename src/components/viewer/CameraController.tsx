import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useViewer } from "../../context/ViewerContext";

export default function CameraController() {
  const { tool, controlsRef } = useViewer();

  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    // Disable orbit when in move or measure mode
    controls.enabled = tool === "rotate";
  }, [tool, controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={0.5}
      maxDistance={500}
    />
  );
}
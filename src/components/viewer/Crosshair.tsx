import { Html, Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Raycaster, Vector2, Vector3 } from "three";

import { useViewer } from "../../context/ViewerContext";

export default function Crosshair() {
  const { tool } = useViewer();

  const { camera, scene, pointer } = useThree();

  const raycaster = useRef(new Raycaster());

  const [position, setPosition] = useState<Vector3 | null>(null);

  useFrame(() => {
    if (tool !== "crosshair") return;

    raycaster.current.setFromCamera(
      new Vector2(pointer.x, pointer.y),
      camera
    );

    const intersects = raycaster.current.intersectObjects(
      scene.children,
      true
    );

    if (intersects.length > 0) {
      setPosition(intersects[0].point.clone());
    }
  });

  if (tool !== "crosshair") return null;

  if (!position) return null;

  return (
    <>
      <Sphere
        args={[0.05]}
        position={position}
      >
        <meshStandardMaterial color="cyan" />
      </Sphere>

      <Html
        position={position.clone().add(new Vector3(0, 0.2, 0))}
        distanceFactor={8}
      >
        <div className="rounded-lg bg-slate-900/90 border border-cyan-500 px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap">
          <div className="font-semibold text-cyan-400">
            Crosshair
          </div>

          <div>X : {position.x.toFixed(3)}</div>
          <div>Y : {position.y.toFixed(3)}</div>
          <div>Z : {position.z.toFixed(3)}</div>
        </div>
      </Html>
    </>
  );
}
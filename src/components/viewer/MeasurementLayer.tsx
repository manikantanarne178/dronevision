import { Html, Line, Sphere } from "@react-three/drei";
import { Vector3 } from "three";

import { useViewer } from "../../context/ViewerContext";

export default function MeasurementLayer() {
  const { measurementPoints } = useViewer();

  if (measurementPoints.length === 0) return null;

  const hasMeasurement = measurementPoints.length === 2;

  let distance = 0;
  let midpoint: Vector3 | null = null;

  if (hasMeasurement) {
    distance = measurementPoints[0].distanceTo(
      measurementPoints[1]
    );

    midpoint = measurementPoints[0]
      .clone()
      .add(measurementPoints[1])
      .multiplyScalar(0.5)
      .add(new Vector3(0, 0.25, 0));
  }

  return (
    <>
      {/* Measurement Points */}
      {measurementPoints.map((point, index) => (
        <group key={index}>
          {/* Red Marker */}
          <Sphere
            args={[0.05]}
            position={point}
          >
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={1}
            />
          </Sphere>

          {/* Point Label */}
          <Html
            position={point.clone().add(new Vector3(0, 0.18, 0))}
            center
            distanceFactor={10}
          >
            <div className="rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white shadow-lg select-none">
              P{index + 1}
            </div>
          </Html>
        </group>
      ))}

      {/* Measurement Line */}
      {hasMeasurement && (
        <>
          <Line
            points={measurementPoints}
            color="#22c55e"
            lineWidth={3}
          />

          {/* Distance Badge */}
          {midpoint && (
            <Html
              position={midpoint}
              center
              distanceFactor={10}
            >
              <div className="rounded-xl border border-cyan-500 bg-slate-900/95 px-4 py-2 shadow-2xl select-none">
                <div className="text-center text-[11px] uppercase tracking-wide text-slate-400">
                  Distance
                </div>

                <div className="mt-1 text-center text-lg font-bold text-cyan-400">
                  {distance.toFixed(3)} m
                </div>
              </div>
            </Html>
          )}
        </>
      )}
    </>
  );
}
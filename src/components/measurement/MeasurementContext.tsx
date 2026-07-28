import { createContext, useContext, useState } from "react";
import * as THREE from "three";

interface MeasurementContextType {
  points: THREE.Vector3[];
  addPoint: (point: THREE.Vector3) => void;
  clearPoints: () => void;
}

const MeasurementContext = createContext<MeasurementContextType | null>(null);

export function MeasurementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  function addPoint(point: THREE.Vector3) {
    setPoints((prev) => {
      if (prev.length >= 2) {
        return [point];
      }
      return [...prev, point];
    });
  }

  function clearPoints() {
    setPoints([]);
  }

  return (
    <MeasurementContext.Provider
      value={{ points, addPoint, clearPoints }}
    >
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurement() {
  const context = useContext(MeasurementContext);

  if (!context) {
    throw new Error("useMeasurement must be used inside MeasurementProvider");
  }

  return context;
}
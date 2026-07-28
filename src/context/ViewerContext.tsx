import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type Tool =
  | "move"
  | "rotate"
  | "measure"
  | "crosshair";

interface ViewerContextType {
  tool: Tool;
  setTool: (tool: Tool) => void;

  measurementPoints: Vector3[];
  setMeasurementPoints: React.Dispatch<
    React.SetStateAction<Vector3[]>
  >;

  controlsRef: RefObject<OrbitControlsImpl | null>;

  resetCamera: () => void;

  clearMeasurements: () => void;

  downloadModel: (url: string, fileName?: string) => void;
}

const ViewerContext = createContext<ViewerContextType | null>(null);

export function ViewerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tool, setTool] = useState<Tool>("rotate");

  const [measurementPoints, setMeasurementPoints] = useState<Vector3[]>([]);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  function resetCamera() {
    controlsRef.current?.reset();
  }

  function clearMeasurements() {
    setMeasurementPoints([]);
  }

  function downloadModel(
    url: string,
    fileName = "model.glb"
  ) {
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  return (
    <ViewerContext.Provider
      value={{
        tool,
        setTool,

        measurementPoints,
        setMeasurementPoints,

        controlsRef,

        resetCamera,

        clearMeasurements,

        downloadModel,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);

  if (!context) {
    throw new Error(
      "useViewer must be used inside ViewerProvider"
    );
  }

  return context;
}
import { createContext, useContext, useState } from "react";

interface ViewerStateType {
  showGrid: boolean;
  wireframe: boolean;

  toggleGrid: () => void;
  toggleWireframe: () => void;
}

const ViewerState = createContext<ViewerStateType | null>(null);

export function ViewerStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  return (
    <ViewerState.Provider
      value={{
        showGrid,
        wireframe,

        toggleGrid() {
          setShowGrid((v) => !v);
        },

        toggleWireframe() {
          setWireframe((v) => !v);
        },
      }}
    >
      {children}
    </ViewerState.Provider>
  );
}

export function useViewerState() {
  const ctx = useContext(ViewerState);

  if (!ctx) {
    throw new Error("ViewerState missing");
  }

  return ctx;
}
import { useParams } from "react-router-dom";
import ProjectSelector from "../components/common/ProjectSelector";
import ViewerToolbar from "../components/viewer/ViewerToolbar";
import ViewerCanvas from "../components/viewer/ViewerCanvas";
import ViewerSidebar from "../components/viewer/ViewerSidebar";
import { ViewerProvider } from "../context/ViewerContext";
import { MeasurementProvider } from "../components/measurement/MeasurementContext";
import { ViewerStateProvider } from "../context/ViewerState";

function ViewerScreen() {
  return (
    <ViewerProvider>
      <ViewerStateProvider>
        <MeasurementProvider>
          <div className="h-[calc(100vh-100px)] flex bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <ViewerToolbar />
            <div className="flex-1 p-2 overflow-hidden relative">
              <ViewerCanvas />
            </div>
            <ViewerSidebar />
          </div>
        </MeasurementProvider>
      </ViewerStateProvider>
    </ViewerProvider>
  );
}

export default function Viewer() {
  const { projectId } = useParams();

  if (!projectId) {
    return (
      <ProjectSelector
        title="3D Model Viewer"
        subtitle="Select a reconstructed photogrammetry project to launch the interactive 3D spatial viewport"
        navigateTo="/viewer"
      />
    );
  }

  return <ViewerScreen />;
}
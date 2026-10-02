import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectSelector from "../components/common/ProjectSelector";
import ViewerToolbar from "../components/viewer/ViewerToolbar";
import ViewerCanvas from "../components/viewer/ViewerCanvas";
import ViewerSidebar from "../components/viewer/ViewerSidebar";
import { ViewerProvider } from "../context/ViewerContext";
import { MeasurementProvider } from "../components/measurement/MeasurementContext";
import { ViewerStateProvider } from "../context/ViewerState";
import { useDroneSurvey } from "../context/DroneSurveyContext";

function ViewerScreen() {
  return (
    <ViewerProvider>
      <ViewerStateProvider>
        <MeasurementProvider>
          <div className="h-[calc(100vh-110px)] flex bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
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
  const { activeSurvey, surveys, setActiveSurveyId } = useDroneSurvey();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      const match = surveys.find(
        (s) => s.id === projectId || s.backendProjectId === projectId
      );
      if (match) {
        setActiveSurveyId(match.id);
      }
    } else if (activeSurvey?.backendProjectId) {
      // Auto redirect to active survey's model
      navigate(`/viewer/${activeSurvey.backendProjectId}`, { replace: true });
    }
  }, [projectId, activeSurvey, surveys, setActiveSurveyId, navigate]);

  if (!projectId && !activeSurvey?.backendProjectId) {
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
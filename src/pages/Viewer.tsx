import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DroneProjectBar from "../components/viewer/DroneProjectBar";
import ViewerToolbar from "../components/viewer/ViewerToolbar";
import ViewerCanvas from "../components/viewer/ViewerCanvas";
import ViewerSidebar from "../components/viewer/ViewerSidebar";
import { ViewerProvider } from "../context/ViewerContext";
import { MeasurementProvider } from "../components/measurement/MeasurementContext";
import { ViewerStateProvider } from "../context/ViewerState";
import { useDroneSurvey } from "../context/DroneSurveyContext";

function ViewerScreen({ currentProjectId }: { currentProjectId: string }) {
  const navigate = useNavigate();

  return (
    <ViewerProvider>
      <ViewerStateProvider>
        <MeasurementProvider>
          <div className="space-y-3">
            {/* Top Project Switcher Bar */}
            <DroneProjectBar
              currentProjectId={currentProjectId}
              onProjectChange={(newId) => {
                navigate(`/viewer/${newId}`);
              }}
            />

            {/* 3D Viewport & Controls */}
            <div className="h-[calc(100vh-170px)] min-h-[500px] flex bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <ViewerToolbar />
              <div className="flex-1 p-2 overflow-hidden relative">
                <ViewerCanvas />
              </div>
              <ViewerSidebar />
            </div>
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
      navigate(`/viewer/${activeSurvey.backendProjectId}`, { replace: true });
    }
  }, [projectId, activeSurvey, surveys, setActiveSurveyId, navigate]);

  const activeId = projectId || activeSurvey?.backendProjectId || activeSurvey?.id || "";

  if (!activeId) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4">
        <DroneProjectBar
          onProjectChange={(newId) => {
            navigate(`/viewer/${newId}`);
          }}
        />
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-sm font-semibold text-slate-700">No active Drone project selected</p>
          <p className="text-xs text-slate-500 mt-1">
            Please select a drone project from the switcher above or upload a new aerial survey dataset.
          </p>
        </div>
      </div>
    );
  }

  return <ViewerScreen currentProjectId={activeId} />;
}
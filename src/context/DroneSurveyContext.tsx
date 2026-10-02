import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api";
import {
  type DroneSurvey,
  buildSurveyFromFiles,
  loadStoredSurveys,
  saveStoredSurveys,
  getStoredActiveSurveyId,
  setStoredActiveSurveyId,
  generateSurveyDXF,
} from "../services/droneSurveyService";

interface DroneSurveyContextType {
  surveys: DroneSurvey[];
  activeSurvey: DroneSurvey | null;
  activeSurveyId: string | null;
  loading: boolean;
  setActiveSurveyId: (id: string | null) => void;
  createSurvey: (
    files: File[],
    surveyName?: string,
    onProgress?: (stage: string, pct: number) => void
  ) => Promise<DroneSurvey>;
  deleteSurvey: (id: string) => Promise<void>;
  refreshSurveys: () => Promise<void>;
  exportDXF: (survey?: DroneSurvey) => void;
}

const DroneSurveyContext = createContext<DroneSurveyContextType | undefined>(
  undefined
);

export const DroneSurveyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [surveys, setSurveys] = useState<DroneSurvey[]>(() =>
    loadStoredSurveys()
  );
  const [activeSurveyId, setActiveSurveyIdState] = useState<string | null>(() =>
    getStoredActiveSurveyId()
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Sync active survey with ID
  const activeSurvey =
    surveys.find((s) => s.id === activeSurveyId || s.backendProjectId === activeSurveyId) ||
    surveys[0] ||
    null;

  const setActiveSurveyId = useCallback((id: string | null) => {
    setActiveSurveyIdState(id);
    setStoredActiveSurveyId(id);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredSurveys(surveys);
  }, [surveys]);

  // Sync surveys from live backend projects
  const refreshSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/projects/");
      const backendProjects: any[] = res.data?.projects || res.data || [];

      if (Array.isArray(backendProjects)) {
        setSurveys((prev) => {
          const updated = [...prev];
          for (const bp of backendProjects) {
            const existingIdx = updated.findIndex(
              (s) => s.backendProjectId === bp.project_id || s.id === bp.project_id
            );
            if (existingIdx >= 0) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                backendProjectId: bp.project_id,
                reconstructionStatus: bp.model_url ? "available" : "pending",
                modelUrl: bp.model_url || updated[existingIdx].modelUrl,
                processingTime: bp.processing_time || updated[existingIdx].processingTime,
              };
            }
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn("Backend project sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSurveys();
  }, [refreshSurveys]);

  // Create survey from uploaded files
  const createSurvey = async (
    files: File[],
    surveyName?: string,
    onProgress?: (stage: string, pct: number) => void
  ): Promise<DroneSurvey> => {
    onProgress?.("Extracting EXIF & GNSS Metadata...", 20);

    const survey = await buildSurveyFromFiles(files, surveyName);

    try {
      onProgress?.("Uploading raw drone imagery to Live Processing Engine...", 50);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const uploadRes = await API.post("/api/upload/images", formData);
      console.log("Uploaded images response:", uploadRes.data);

      onProgress?.("Triggering 3D Photogrammetry Reconstruction Pipeline...", 80);
      const reconRes = await API.post("/api/reconstruction/generate", {});
      console.log("Reconstruction response:", reconRes.data);

      const projectId = reconRes.data?.project_id;
      if (projectId) {
        survey.backendProjectId = projectId;
        survey.reconstructionStatus = "available";
        survey.modelUrl = `/api/projects/${projectId}/model`;
        survey.processingTime = reconRes.data?.processing_time || 2.5;
      }
    } catch (err: any) {
      console.warn("Backend reconstruction fallback:", err);
      survey.reconstructionStatus = "unavailable";
      if (!survey.warnings) survey.warnings = [];
      survey.warnings.push(
        "Backend photogrammetry pipeline was unreachable or timed out. Telemetry and flight geometry extracted locally."
      );
    }

    onProgress?.("Finalizing mission data...", 100);

    setSurveys((prev) => [survey, ...prev]);
    setActiveSurveyId(survey.id);
    return survey;
  };

  const deleteSurvey = async (id: string) => {
    const target = surveys.find((s) => s.id === id || s.backendProjectId === id);
    if (target?.backendProjectId) {
      try {
        await API.delete(`/api/projects/${target.backendProjectId}`);
      } catch (err) {
        console.warn("Backend project deletion notice:", err);
      }
    }

    setSurveys((prev) => prev.filter((s) => s.id !== id && s.backendProjectId !== id));
    if (activeSurveyId === id || activeSurvey?.id === id) {
      const remaining = surveys.filter((s) => s.id !== id && s.backendProjectId !== id);
      setActiveSurveyId(remaining[0]?.id || null);
    }
  };

  const exportDXF = (targetSurvey?: DroneSurvey) => {
    const survey = targetSurvey || activeSurvey;
    if (!survey) {
      alert("No active survey selected to export DXF.");
      return;
    }

    const blob = generateSurveyDXF(survey);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${survey.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_SURVEY.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DroneSurveyContext.Provider
      value={{
        surveys,
        activeSurvey,
        activeSurveyId,
        loading,
        setActiveSurveyId,
        createSurvey,
        deleteSurvey,
        refreshSurveys,
        exportDXF,
      }}
    >
      {children}
    </DroneSurveyContext.Provider>
  );
};

export const useDroneSurvey = (): DroneSurveyContextType => {
  const context = useContext(DroneSurveyContext);
  if (!context) {
    throw new Error(
      "useDroneSurvey must be used within a DroneSurveyProvider"
    );
  }
  return context;
};

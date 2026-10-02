import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import API, { pingBackendHealth, ensureAuthToken } from "../api";
import {
  type DroneSurvey,
  buildSurveyFromFiles,
  loadStoredSurveys,
  saveStoredSurveys,
  getStoredActiveSurveyId,
  setStoredActiveSurveyId,
  generateSurveyDXF,
} from "../services/droneSurveyService";

export interface UploadProgressDetail {
  stage: string;
  percentage: number;
  loadedBytes?: number;
  totalBytes?: number;
  loadedMB?: string;
  totalMB?: string;
  uploadSpeed?: string;
}

interface DroneSurveyContextType {
  surveys: DroneSurvey[];
  activeSurvey: DroneSurvey | null;
  activeSurveyId: string | null;
  loading: boolean;
  isUploading: boolean;
  setActiveSurveyId: (id: string | null) => void;
  createSurvey: (
    files: File[],
    surveyName?: string,
    onProgress?: (detail: UploadProgressDetail) => void
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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadLockRef = useRef<boolean>(false);

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

  // Create survey from uploaded files with robust multipart streaming & timeout immunity
  const createSurvey = async (
    files: File[],
    surveyName?: string,
    onProgress?: (detail: UploadProgressDetail) => void
  ): Promise<DroneSurvey> => {
    if (uploadLockRef.current) {
      throw new Error("An upload operation is already in progress. Please wait.");
    }

    uploadLockRef.current = true;
    setIsUploading(true);

    const totalPayloadBytes = files.reduce((sum, f) => sum + f.size, 0);
    const totalPayloadMB = (totalPayloadBytes / (1024 * 1024)).toFixed(1);

    try {
      // Step 0: Guarantee valid session authorization token exists
      await ensureAuthToken();

      // Step 1: Client-side EXIF & Telemetry Extraction
      onProgress?.({
        stage: `Extracting EXIF & GNSS telemetry from ${files.length} images...`,
        percentage: 10,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
      });

      const survey = await buildSurveyFromFiles(files, surveyName);

      // Step 2: Pre-flight Render health check to wake up sleeping instance
      onProgress?.({
        stage: "Connecting to Live Render Processing Server...",
        percentage: 15,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
      });

      const isServerAwake = await pingBackendHealth((attempt, max) => {
        onProgress?.({
          stage: `Connecting to processing server (attempt ${attempt}/${max})...`,
          percentage: 12 + attempt * 2,
          totalBytes: totalPayloadBytes,
          totalMB: totalPayloadMB,
        });
      });

      if (!isServerAwake) {
        console.warn("Health check unconfirmed, proceeding with direct upload attempt.");
      }

      // Step 3: Stream Multipart Payload with real-time byte tracking and generous timeout
      onProgress?.({
        stage: `Streaming ${files.length} images (${totalPayloadMB} MB) to backend...`,
        percentage: 20,
        loadedBytes: 0,
        totalBytes: totalPayloadBytes,
        loadedMB: "0.0",
        totalMB: totalPayloadMB,
      });

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const startTime = Date.now();

      // Note: Do NOT manually set Content-Type header so browser appends proper multipart boundary
      const uploadRes = await API.post("/api/upload/images", formData, {
        timeout: 900000, // 15 minutes timeout for large datasets
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || totalPayloadBytes;
          const loaded = progressEvent.loaded;
          const fraction = total > 0 ? loaded / total : 0;
          // Scale upload progress between 20% and 80%
          const percentage = Math.min(80, Math.round(20 + fraction * 60));

          const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
          const elapsedSec = (Date.now() - startTime) / 1000;
          const speedMBs = elapsedSec > 0 ? (loaded / (1024 * 1024) / elapsedSec).toFixed(2) : "0.0";

          onProgress?.({
            stage: `Uploading: ${loadedMB} MB / ${totalPayloadMB} MB (${speedMBs} MB/s)`,
            percentage,
            loadedBytes: loaded,
            totalBytes: total,
            loadedMB,
            totalMB: totalPayloadMB,
            uploadSpeed: `${speedMBs} MB/s`,
          });
        },
      });

      console.log("Uploaded images response:", uploadRes.data);

      // Step 4: Run 3D Photogrammetry Reconstruction Pipeline
      onProgress?.({
        stage: "Ingestion complete. Processing SfM photogrammetry & 3D mesh reconstruction...",
        percentage: 85,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
      });

      const reconRes = await API.post(
        "/api/reconstruction/generate",
        {},
        {
          timeout: 300000, // 5 minutes timeout for 3D SfM reconstruction
        }
      );

      console.log("Reconstruction response:", reconRes.data);

      const projectId = reconRes.data?.project_id;
      if (projectId) {
        survey.backendProjectId = projectId;
        survey.reconstructionStatus = "available";
        survey.modelUrl = `/api/projects/${projectId}/model`;
        survey.processingTime = reconRes.data?.processing_time || 2.5;
      }

      onProgress?.({
        stage: "Reconstruction complete! Finalizing survey telemetry...",
        percentage: 100,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
      });

      setSurveys((prev) => [survey, ...prev]);
      setActiveSurveyId(survey.id);
      return survey;
    } catch (err: any) {
      console.error("Survey creation error:", err);

      let errorMessage = "Upload failed. Please check network connection.";
      if (err.code === "ECONNABORTED") {
        errorMessage = "Upload timed out (ECONNABORTED). The network speed was insufficient for the dataset size. Please retry.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication error (HTTP 401): Session expired or invalid token.";
      } else if (err.response?.status === 408) {
        errorMessage = "Server timeout (HTTP 408): The processing server closed the connection.";
      } else if (err.response?.status === 413) {
        errorMessage = "Payload too large (HTTP 413): The uploaded dataset exceeded the server's single-request limit.";
      } else if (err.response?.status === 422) {
        const detail = err.response.data?.detail;
        errorMessage = `Validation error (HTTP 422): ${typeof detail === "string" ? detail : JSON.stringify(detail)}`;
      } else if (err.response?.status === 500) {
        const detail = err.response.data?.detail || "Internal Server Error in 3D Reconstruction pipeline";
        errorMessage = `3D Reconstruction Error (HTTP 500): ${typeof detail === "string" ? detail : JSON.stringify(detail)}`;
      } else if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
        errorMessage = `Server gateway notice (HTTP ${err.response.status}): Render backend is temporarily waking up or restarting.`;
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Network Error: Failed to communicate with https://dronbackend.onrender.com (CORS or server unreachable).";
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMessage = typeof detail === "string" ? detail : JSON.stringify(detail);
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new Error(errorMessage);
    } finally {
      uploadLockRef.current = false;
      setIsUploading(false);
    }
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
        isUploading,
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

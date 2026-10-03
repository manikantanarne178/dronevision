import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import API, { API_BASE_URL, pingBackendHealth, ensureAuthToken } from "../api";
import {
  type DroneSurvey,
  buildSurveyFromFiles,
  loadStoredSurveys,
  saveStoredSurveys,
  getStoredActiveSurveyId,
  setStoredActiveSurveyId,
  generateSurveyDXF,
} from "../services/droneSurveyService";
import {
  type PipelineStage,
  type UIState,
  type PipelineCorrelation,
  type PipelineErrorInfo,
  logPipeline,
  logPipelineSuccess,
  logPipelineFailure,
  parsePipelineError,
} from "../services/pipelineService";

export interface UploadProgressDetail {
  stage: string;
  percentage: number;
  loadedBytes?: number;
  totalBytes?: number;
  loadedMB?: string;
  totalMB?: string;
  uploadSpeed?: string;
  pipelineStage?: PipelineStage;
  uiState?: UIState;
}

interface DroneSurveyContextType {
  surveys: DroneSurvey[];
  activeSurvey: DroneSurvey | null;
  activeSurveyId: string | null;
  loading: boolean;
  isUploading: boolean;
  uiState: UIState;
  pipelineError: PipelineErrorInfo | null;
  lastUploadId: string | null;
  clearError: () => void;
  setActiveSurveyId: (id: string | null) => void;
  createSurvey: (
    files: File[],
    surveyName?: string,
    onProgress?: (detail: UploadProgressDetail) => void,
    reuseUploadId?: string
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
  const [uiState, setUiState] = useState<UIState>("IDLE");
  const [pipelineError, setPipelineError] = useState<PipelineErrorInfo | null>(null);
  const [lastUploadId, setLastUploadId] = useState<string | null>(null);
  const uploadLockRef = useRef<boolean>(false);

  const clearError = useCallback(() => {
    setPipelineError(null);
    if (uiState === "FAILED") {
      setUiState("IDLE");
    }
  }, [uiState]);

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
      logPipeline("PROJECT_FETCH", "GET", `${API_BASE_URL}/api/projects/`);
      const res = await API.get("/api/projects/");
      logPipelineSuccess("PROJECT_FETCH", res.status, `${API_BASE_URL}/api/projects/`, res.data);

      const backendProjects: any[] = res.data?.projects || res.data || [];

      if (Array.isArray(backendProjects)) {
        setSurveys((prev) => {
          const result: DroneSurvey[] = [];
          
          for (const bp of backendProjects) {
            const existing = prev.find(
              (s) => s.backendProjectId === bp.project_id || s.id === bp.project_id
            );

            if (existing) {
              result.push({
                ...existing,
                backendProjectId: bp.project_id,
                name: bp.name || existing.name,
                imageCount: bp.images_uploaded || existing.imageCount,
                reconstructionStatus: bp.model_url ? "available" : "pending",
                modelUrl: bp.model_url || existing.modelUrl,
                processingTime: bp.processing_time || existing.processingTime,
                areaSqm: bp.surface_area || bp.ground_area || existing.areaSqm,
              });
            } else {
              result.push({
                id: bp.project_id,
                backendProjectId: bp.project_id,
                name: bp.name || `Survey ${bp.project_id}`,
                createdAt: bp.generated_at || new Date().toISOString(),
                imageCount: bp.images_uploaded || 0,
                geotaggedImageCount: bp.images_uploaded || 0,
                coordinateSystem: "WGS84",
                images: [],
                flightPath: [],
                surveyBoundary: [],
                areaSqm: bp.surface_area || bp.ground_area || 0,
                areaSqft: Math.round((bp.surface_area || bp.ground_area || 0) * 10.7639 * 100) / 100,
                areaAcres: Math.round(((bp.surface_area || bp.ground_area || 0) / 4046.86) * 1000) / 1000,
                areaHectares: Math.round(((bp.surface_area || bp.ground_area || 0) / 10000) * 1000) / 1000,
                perimeterM: 0,
                boundingBox: bp.width > 0 ? {
                  minLat: 0,
                  maxLat: 0,
                  minLng: 0,
                  maxLng: 0,
                  widthM: bp.width,
                  lengthM: bp.length,
                } : undefined,
                elevation: bp.height > 0 ? {
                  minElevation: 0,
                  maxElevation: bp.height,
                  deltaElevation: bp.height,
                  avgElevation: bp.height / 2,
                } : undefined,
                processingStatus: "completed",
                reconstructionStatus: bp.model_url ? "available" : "pending",
                modelUrl: bp.model_url || `/api/projects/${bp.project_id}/model`,
                processingTime: bp.processing_time || 0,
              });
            }
          }

          // Keep in-memory in-flight surveys that haven't received project_id yet
          for (const s of prev) {
            if (!s.backendProjectId && !result.some((r) => r.id === s.id)) {
              result.unshift(s);
            }
          }

          return result;
        });
      }
    } catch (err) {
      logPipelineFailure("PROJECT_FETCH", `${API_BASE_URL}/api/projects/`, err);
      console.warn("Backend project sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSurveys();
  }, [refreshSurveys]);

  // Create survey from uploaded files with robust multipart streaming & async background job polling
  const createSurvey = async (
    files: File[],
    surveyName?: string,
    onProgress?: (detail: UploadProgressDetail) => void,
    reuseUploadId?: string
  ): Promise<DroneSurvey> => {
    if (uploadLockRef.current) {
      throw new Error("An upload operation is already in progress. Please wait.");
    }

    uploadLockRef.current = true;
    setIsUploading(true);
    setPipelineError(null);
    setUiState("VALIDATING");

    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let currentStage: PipelineStage = "IMAGE_VALIDATION";
    let currentEndpoint = "client";
    let activeUploadId: string | undefined = reuseUploadId || undefined;
    let activeJobId: string | undefined = undefined;
    let activeProjectId: string | undefined = undefined;

    const correlation: PipelineCorrelation = {
      requestId,
      uploadId: activeUploadId,
    };

    const totalPayloadBytes = files.reduce((sum, f) => sum + f.size, 0);
    const totalPayloadMB = (totalPayloadBytes / (1024 * 1024)).toFixed(1);

    try {
      // -------------------------------------------------------------
      // STAGE 1: HEALTH CHECK
      // -------------------------------------------------------------
      currentStage = "HEALTH";
      currentEndpoint = `${API_BASE_URL}/health`;
      logPipeline(currentStage, "GET", currentEndpoint, correlation);

      onProgress?.({
        stage: "Checking live Render backend health...",
        percentage: 5,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
        pipelineStage: currentStage,
        uiState: "VALIDATING",
      });

      const isServerAwake = await pingBackendHealth((attempt, max) => {
        onProgress?.({
          stage: `Connecting to processing server (attempt ${attempt}/${max})...`,
          percentage: 5 + attempt * 2,
          totalBytes: totalPayloadBytes,
          totalMB: totalPayloadMB,
          pipelineStage: currentStage,
          uiState: "VALIDATING",
        });
      });

      if (isServerAwake) {
        logPipelineSuccess(currentStage, 200, currentEndpoint, { status: "online" }, correlation);
      } else {
        logPipelineFailure(currentStage, currentEndpoint, new Error("Server cold-start ping unconfirmed"), undefined, undefined, undefined, correlation);
      }

      // Guarantee valid session authorization token exists
      await ensureAuthToken();

      // -------------------------------------------------------------
      // STAGE 2: IMAGE VALIDATION
      // -------------------------------------------------------------
      currentStage = "IMAGE_VALIDATION";
      currentEndpoint = "client_validation";
      logPipeline(currentStage, "VALIDATE", currentEndpoint, correlation);

      if (!files || files.length === 0) {
        throw new Error("No drone imagery files selected for upload.");
      }

      for (const file of files) {
        if (file.size === 0) {
          throw new Error(`File ${file.name} is empty (0 bytes). Invalid drone image.`);
        }
      }
      logPipelineSuccess(currentStage, "VALID", currentEndpoint, {
        file_count: files.length,
        total_bytes: totalPayloadBytes,
      }, correlation);

      // -------------------------------------------------------------
      // STAGE 7: EXIF & GNSS EXTRACTION & FLIGHT PATH
      // -------------------------------------------------------------
      currentStage = "EXIF_EXTRACTION";
      currentEndpoint = "client_exifr";
      logPipeline(currentStage, "PARSE", currentEndpoint, correlation);

      onProgress?.({
        stage: `Extracting EXIF & GNSS telemetry from ${files.length} images...`,
        percentage: 12,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
        pipelineStage: currentStage,
        uiState: "GNSS_EXTRACTION",
      });

      const survey = await buildSurveyFromFiles(files, surveyName);
      logPipelineSuccess(currentStage, "EXTRACTED", currentEndpoint, {
        images: survey.images.length,
        geotagged: survey.geotaggedImageCount,
      }, correlation);

      currentStage = "GNSS_EXTRACTION";
      logPipelineSuccess(currentStage, "EXTRACTED", currentEndpoint, {
        has_gps: survey.geotaggedImageCount > 0,
        count: survey.geotaggedImageCount,
      }, correlation);

      currentStage = "FLIGHT_PATH";
      logPipelineSuccess(currentStage, "COMPUTED", currentEndpoint, {
        waypoints: survey.flightPath.length,
        areaSqm: survey.areaSqm,
        perimeterM: survey.perimeterM,
      }, correlation);

      // -------------------------------------------------------------
      // STAGE 3: IMAGE UPLOAD (Skip if reusing existing valid upload)
      // -------------------------------------------------------------
      let sessionUploadId = activeUploadId;

      if (!sessionUploadId) {
        currentStage = "IMAGE_UPLOAD";
        currentEndpoint = `${API_BASE_URL}/api/upload/images`;
        setUiState("UPLOADING");
        logPipeline(currentStage, "POST", currentEndpoint, correlation);

        onProgress?.({
          stage: `Streaming ${files.length} images (${totalPayloadMB} MB) to backend...`,
          percentage: 20,
          loadedBytes: 0,
          totalBytes: totalPayloadBytes,
          loadedMB: "0.0",
          totalMB: totalPayloadMB,
          pipelineStage: currentStage,
          uiState: "UPLOADING",
        });

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const startTime = Date.now();

        const uploadRes = await API.post("/api/upload/images", formData, {
          timeout: 900000, // 15 minutes timeout for large datasets
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || totalPayloadBytes;
            const loaded = progressEvent.loaded;
            const fraction = total > 0 ? loaded / total : 0;
            // Scale upload progress between 20% and 75%
            const percentage = Math.min(75, Math.round(20 + fraction * 55));

            const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
            const elapsedSec = (Date.now() - startTime) / 1000;
            const speedMBs =
              elapsedSec > 0
                ? (loaded / (1024 * 1024) / elapsedSec).toFixed(2)
                : "0.0";

            onProgress?.({
              stage: `Uploading: ${loadedMB} MB / ${totalPayloadMB} MB (${speedMBs} MB/s)`,
              percentage,
              loadedBytes: loaded,
              totalBytes: total,
              loadedMB,
              totalMB: totalPayloadMB,
              uploadSpeed: `${speedMBs} MB/s`,
              pipelineStage: "IMAGE_UPLOAD",
              uiState: "UPLOADING",
            });
          },
        });

        logPipelineSuccess(currentStage, uploadRes.status, currentEndpoint, uploadRes.data, correlation);

        currentStage = "UPLOAD_RESPONSE";
        sessionUploadId = uploadRes.data?.upload_id;
        activeUploadId = sessionUploadId;
        correlation.uploadId = sessionUploadId;
        setLastUploadId(sessionUploadId || null);

        logPipelineSuccess(currentStage, 200, currentEndpoint, {
          upload_id: sessionUploadId,
          files_saved: uploadRes.data?.count,
        }, correlation);

        setUiState("UPLOAD_COMPLETE");
      }

      // -------------------------------------------------------------
      // STAGE 5: RECONSTRUCTION START (Initiate Job)
      // -------------------------------------------------------------
      currentStage = "RECONSTRUCTION_START";
      currentEndpoint = `${API_BASE_URL}/api/reconstruction/generate`;
      setUiState("RECONSTRUCTION");
      logPipeline(currentStage, "POST", currentEndpoint, correlation);

      onProgress?.({
        stage: "Ingestion complete. Submitting 3D SfM photogrammetry job...",
        percentage: 78,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
        pipelineStage: currentStage,
        uiState: "RECONSTRUCTION",
      });

      const reconInitRes = await API.post(
        "/api/reconstruction/generate",
        {
          upload_id: sessionUploadId,
          project_name: survey.name,
          request_id: requestId,
        },
        {
          timeout: 60000,
        }
      );

      currentStage = "RECONSTRUCTION_RESPONSE";
      logPipelineSuccess(currentStage, reconInitRes.status, currentEndpoint, reconInitRes.data, correlation);

      const jobId = reconInitRes.data?.job_id;
      activeJobId = jobId;
      correlation.jobId = jobId;

      // -------------------------------------------------------------
      // STAGE 6: POLL RECONSTRUCTION JOB STATUS UNTIL FINISHED
      // -------------------------------------------------------------
      let finalJobData = reconInitRes.data;

      if (jobId && reconInitRes.data?.status !== "COMPLETED") {
        const pollEndpoint = `${API_BASE_URL}/api/reconstruction/status/${jobId}`;
        currentEndpoint = pollEndpoint;
        let jobFinished = false;
        let pollAttempts = 0;
        let consecutiveErrors = 0;

        while (!jobFinished && pollAttempts < 120) {
          pollAttempts++;
          await new Promise((r) => setTimeout(r, 1500));

          try {
            logPipeline("RECONSTRUCTION_RESPONSE", "GET", pollEndpoint, correlation);
            const statusRes = await API.get(`/api/reconstruction/status/${jobId}`, {
              timeout: 10000,
            });
            consecutiveErrors = 0;
            const jobData = statusRes.data;
            finalJobData = jobData;

            const jobStage = jobData.status || jobData.stage;
            if (jobStage === "POINT_CLOUD") {
              setUiState("POINT_CLOUD");
              onProgress?.({
                stage: "Densifying multi-view point cloud...",
                percentage: 86,
                totalBytes: totalPayloadBytes,
                totalMB: totalPayloadMB,
                pipelineStage: "POINT_CLOUD",
                uiState: "POINT_CLOUD",
              });
            } else if (jobStage === "MODEL_GENERATION") {
              setUiState("MODEL_GENERATION");
              onProgress?.({
                stage: "Generating 3D GLB mesh & terrain volume...",
                percentage: 92,
                totalBytes: totalPayloadBytes,
                totalMB: totalPayloadMB,
                pipelineStage: "MODEL_GENERATION",
                uiState: "MODEL_GENERATION",
              });
            } else if (jobStage === "COMPLETED") {
              jobFinished = true;
              break;
            } else if (jobStage === "FAILED") {
              throw new Error(jobData.error || jobData.message || "3D Reconstruction job failed on backend.");
            } else {
              onProgress?.({
                stage: "SfM Photogrammetry & feature triangulation in progress...",
                percentage: 82,
                totalBytes: totalPayloadBytes,
                totalMB: totalPayloadMB,
                pipelineStage: "RECONSTRUCTION",
                uiState: "RECONSTRUCTION",
              });
            }
          } catch (pollErr: any) {
            consecutiveErrors++;
            console.warn(`Status polling notice (attempt ${pollAttempts}, errs ${consecutiveErrors}):`, pollErr);
            if (consecutiveErrors >= 5) {
              throw pollErr;
            }
          }
        }
      }

      const projectId = finalJobData?.project_id;
      activeProjectId = projectId;
      correlation.projectId = projectId;

      if (!projectId) {
        throw new Error("Reconstruction finished without returning a valid project_id.");
      }

      // -------------------------------------------------------------
      // STAGES 10, 11, 12: POINT CLOUD, MODEL GENERATION, PROJECT CREATION
      // -------------------------------------------------------------
      currentStage = "POINT_CLOUD";
      logPipelineSuccess(currentStage, "PASS", currentEndpoint, {
        vertices: finalJobData?.statistics?.vertices,
        engine: finalJobData?.statistics?.engine_used,
      }, correlation);

      currentStage = "MODEL_GENERATION";
      logPipelineSuccess(currentStage, "PASS", currentEndpoint, {
        model_url: finalJobData?.model_url,
      }, correlation);

      currentStage = "PROJECT_CREATION";
      survey.backendProjectId = projectId;
      survey.reconstructionStatus = "available";
      survey.modelUrl = `/api/projects/${projectId}/model`;
      survey.processingTime = finalJobData?.processing_time || 2.5;

      logPipelineSuccess(currentStage, 200, currentEndpoint, {
        project_id: projectId,
        model_url: survey.modelUrl,
      }, correlation);

      setUiState("FINALIZING");
      onProgress?.({
        stage: "Reconstruction complete! Finalizing survey telemetry...",
        percentage: 100,
        totalBytes: totalPayloadBytes,
        totalMB: totalPayloadMB,
        pipelineStage: "FINAL_COMPLETION",
        uiState: "COMPLETED",
      });

      setSurveys((prev) => [survey, ...prev]);
      setActiveSurveyId(survey.id);
      setUiState("COMPLETED");

      logPipelineSuccess("FINAL_COMPLETION", 200, "all_stages", {
        survey_id: survey.id,
        backend_project_id: projectId,
      }, correlation);

      return survey;
    } catch (err: any) {
      setUiState("FAILED");
      const structuredError = parsePipelineError(
        currentStage,
        err,
        currentEndpoint,
        {
          requestId,
          uploadId: activeUploadId,
          projectId: activeProjectId,
          jobId: activeJobId,
        }
      );
      setPipelineError(structuredError);
      throw new Error(structuredError.errorMessage);
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
        uiState,
        pipelineError,
        lastUploadId,
        clearError,
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

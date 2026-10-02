/**
 * DroneVision Ingestion & Reconstruction Pipeline Service
 * Provides structured diagnostics, real-time stage tracking, request correlation, and explicit technical error classification.
 */

export type PipelineStage =
  | "HEALTH"
  | "IMAGE_VALIDATION"
  | "IMAGE_UPLOAD"
  | "UPLOAD_RESPONSE"
  | "RECONSTRUCTION"
  | "RECONSTRUCTION_START"
  | "RECONSTRUCTION_RESPONSE"
  | "EXIF_EXTRACTION"
  | "GNSS_EXTRACTION"
  | "FLIGHT_PATH"
  | "POINT_CLOUD"
  | "MODEL_GENERATION"
  | "PROJECT_CREATION"
  | "PROJECT_FETCH"
  | "MODEL_FETCH"
  | "ANALYTICS_FETCH"
  | "GPS_FETCH"
  | "MODEL_VIEWER"
  | "FINAL_COMPLETION";

export type UIState =
  | "IDLE"
  | "VALIDATING"
  | "UPLOADING"
  | "UPLOAD_COMPLETE"
  | "QUEUED"
  | "RECONSTRUCTION"
  | "GNSS_EXTRACTION"
  | "FLIGHT_PATH"
  | "POINT_CLOUD"
  | "MODEL_GENERATION"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED";

export interface PipelineCorrelation {
  requestId?: string;
  uploadId?: string;
  projectId?: string;
  jobId?: string;
}

export interface PipelineErrorInfo {
  stage: PipelineStage;
  endpoint: string;
  httpStatus?: number | string;
  errorName: string;
  errorMessage: string;
  technicalDetail?: string;
  responseBody?: string;
  requestId?: string;
  uploadId?: string;
  projectId?: string;
  jobId?: string;
  timestamp: string;
}

/**
 * Log pipeline request initiation with full request correlation
 */
export function logPipeline(
  stage: PipelineStage,
  method: string,
  url: string,
  correlation?: PipelineCorrelation
): void {
  const reqStr = correlation?.requestId ? `request_id=${correlation.requestId}\n` : "";
  const upStr = correlation?.uploadId ? `upload_id=${correlation.uploadId}\n` : "";
  const projStr = correlation?.projectId ? `project_id=${correlation.projectId}\n` : "";
  const jobStr = correlation?.jobId ? `job_id=${correlation.jobId}\n` : "";

  console.log(
    `[PIPELINE]\n${reqStr}${upStr}${projStr}${jobStr}stage=${stage}\nmethod=${method}\nurl=${url}`
  );
}

/**
 * Log pipeline request success
 */
export function logPipelineSuccess(
  stage: PipelineStage,
  status: number | string,
  url: string,
  response: any,
  correlation?: PipelineCorrelation
): void {
  const reqStr = correlation?.requestId ? `request_id=${correlation.requestId}\n` : "";
  const upStr = correlation?.uploadId ? `upload_id=${correlation.uploadId}\n` : "";
  const projStr = correlation?.projectId ? `project_id=${correlation.projectId}\n` : "";
  const jobStr = correlation?.jobId ? `job_id=${correlation.jobId}\n` : "";

  const respStr =
    typeof response === "object"
      ? JSON.stringify(response)
      : String(response ?? "");

  console.log(
    `[PIPELINE_SUCCESS]\n${reqStr}${upStr}${projStr}${jobStr}stage=${stage}\nstatus=${status}\nurl=${url}\nresponse=${respStr}`
  );
}

/**
 * Log pipeline failure with full diagnostic fields
 */
export function logPipelineFailure(
  stage: PipelineStage,
  url: string,
  err: any,
  status?: number | string,
  statusText?: string,
  responseBody?: string,
  correlation?: PipelineCorrelation
): void {
  const finalStatus = status ?? err?.response?.status ?? "UNKNOWN";
  const finalStatusText = statusText ?? err?.response?.statusText ?? "";
  const finalRespBody =
    responseBody ??
    (err?.response?.data
      ? typeof err.response.data === "object"
        ? JSON.stringify(err.response.data)
        : String(err.response.data)
      : "");
  const errorName = err?.name || "PipelineError";
  const errorMessage = err?.message || String(err || "Unknown error");

  const reqStr = correlation?.requestId ? `request_id=${correlation.requestId}\n` : "";
  const upStr = correlation?.uploadId ? `upload_id=${correlation.uploadId}\n` : "";
  const projStr = correlation?.projectId ? `project_id=${correlation.projectId}\n` : "";
  const jobStr = correlation?.jobId ? `job_id=${correlation.jobId}\n` : "";

  if (err?.code === "ERR_NETWORK" && !err?.response) {
    console.error(
      `[PIPELINE_NETWORK_FAILURE]\n${reqStr}${upStr}${projStr}${jobStr}stage=${stage}\nurl=${url}\nerrorName=${errorName}\nerrorMessage=${errorMessage}`
    );
  } else {
    console.error(
      `[PIPELINE_FAILURE]\n${reqStr}${upStr}${projStr}${jobStr}stage=${stage}\nstatus=${finalStatus}\nurl=${url}\nstatusText=${finalStatusText}\nresponseBody=${finalRespBody}\nerrorName=${errorName}\nerrorMessage=${errorMessage}`
    );
  }
}

/**
 * Parses any pipeline exception into a structured technical error.
 * Handles server restarts, timeouts, disconnects, and HTTP status codes accurately.
 */
export function parsePipelineError(
  stage: PipelineStage,
  err: any,
  endpoint: string,
  correlation?: PipelineCorrelation
): PipelineErrorInfo {
  const now = new Date().toISOString();
  const errorName = err?.name || (err?.response ? "AxiosHTTPError" : "Error");
  const responseData = err?.response?.data;
  let responseBodyStr = "";

  if (responseData) {
    responseBodyStr =
      typeof responseData === "object"
        ? JSON.stringify(responseData)
        : String(responseData);
  }

  // Determine technical backend detail message
  let backendDetail = "";
  if (responseData?.detail) {
    backendDetail =
      typeof responseData.detail === "string"
        ? responseData.detail
        : JSON.stringify(responseData.detail);
  } else if (responseData?.message) {
    backendDetail =
      typeof responseData.message === "string"
        ? responseData.message
        : JSON.stringify(responseData.message);
  } else if (responseBodyStr) {
    backendDetail = responseBodyStr;
  }

  const httpStatus = err?.response?.status;
  let userFacingMessage = "";

  if (httpStatus) {
    switch (httpStatus) {
      case 500:
        userFacingMessage = `Reconstruction failed — HTTP 500: ${backendDetail || "Internal server photogrammetry error."}`;
        break;
      case 422:
        userFacingMessage = `Invalid reconstruction request — HTTP 422: ${backendDetail || "Unprocessable entity payload."}`;
        break;
      case 404:
        userFacingMessage = `Requested resource was not found — HTTP 404: ${backendDetail || `Endpoint ${endpoint} not found.`}`;
        break;
      case 401:
      case 403:
        userFacingMessage = `Authentication/permission error — HTTP ${httpStatus}: ${backendDetail || "Session expired or invalid credentials."}`;
        break;
      case 413:
        userFacingMessage = `Payload too large — HTTP 413: The uploaded dataset exceeded single-request limits.`;
        break;
      case 408:
        userFacingMessage = `Server timeout — HTTP 408: Connection timed out on processing server.`;
        break;
      case 502:
      case 503:
      case 504:
        userFacingMessage = `Processing server connection was interrupted during reconstruction (HTTP ${httpStatus}). Render server restarted or is waking up.`;
        break;
      default:
        userFacingMessage = `Backend returned HTTP ${httpStatus}: ${backendDetail || err.message || "Unknown HTTP error"}`;
        break;
    }
  } else if (err?.code === "ECONNABORTED") {
    userFacingMessage = `Connection timed out (ECONNABORTED): The processing operation exceeded the connection timeout limit.`;
  } else if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
    if (stage === "RECONSTRUCTION_START" || stage === "RECONSTRUCTION_RESPONSE" || stage === "POINT_CLOUD") {
      userFacingMessage = `Processing server connection was interrupted during reconstruction.`;
    } else if (typeof navigator !== "undefined" && !navigator.onLine) {
      userFacingMessage = `Client Offline: Your device lost internet connectivity during ${stage}.`;
    } else {
      userFacingMessage = `Network connection dropped during ${stage} to ${endpoint}. (Server restarted or disconnected).`;
    }
  } else if (err instanceof Error) {
    userFacingMessage = `Frontend processing error after backend stage ${stage}: ${err.message}`;
  } else {
    userFacingMessage = String(err || "An unknown technical error occurred.");
  }

  // Structured failure output
  logPipelineFailure(
    stage,
    endpoint,
    err,
    httpStatus,
    err?.response?.statusText,
    responseBodyStr,
    correlation
  );

  return {
    stage,
    endpoint,
    httpStatus,
    errorName,
    errorMessage: userFacingMessage,
    technicalDetail: backendDetail || err?.message,
    responseBody: responseBodyStr,
    requestId: correlation?.requestId,
    uploadId: correlation?.uploadId || responseData?.upload_id,
    projectId: correlation?.projectId || responseData?.project_id,
    jobId: correlation?.jobId || responseData?.job_id,
    timestamp: now,
  };
}

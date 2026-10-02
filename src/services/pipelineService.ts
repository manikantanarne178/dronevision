/**
 * DroneVision Ingestion & Reconstruction Pipeline Service
 * Provides structured diagnostics, real-time stage tracking, and explicit technical error classification.
 */

export type PipelineStage =
  | "HEALTH"
  | "IMAGE_VALIDATION"
  | "IMAGE_UPLOAD"
  | "UPLOAD_RESPONSE"
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
  | "RECONSTRUCTION"
  | "GNSS_EXTRACTION"
  | "FLIGHT_PATH"
  | "POINT_CLOUD"
  | "MODEL_GENERATION"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED";

export interface PipelineErrorInfo {
  stage: PipelineStage;
  endpoint: string;
  httpStatus?: number | string;
  errorName: string;
  errorMessage: string;
  technicalDetail?: string;
  responseBody?: string;
  requestId?: string;
  timestamp: string;
}

/**
 * Log pipeline request initiation
 */
export function logPipeline(stage: PipelineStage, method: string, url: string): void {
  console.log(
    `[PIPELINE]\nstage=${stage}\nmethod=${method}\nurl=${url}`
  );
}

/**
 * Log pipeline request success
 */
export function logPipelineSuccess(
  stage: PipelineStage,
  status: number | string,
  url: string,
  response: any
): void {
  const respStr =
    typeof response === "object"
      ? JSON.stringify(response)
      : String(response ?? "");
  console.log(
    `[PIPELINE_SUCCESS]\nstage=${stage}\nstatus=${status}\nurl=${url}\nresponse=${respStr}`
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
  responseBody?: string
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

  if (err?.code === "ERR_NETWORK" && !err?.response) {
    console.error(
      `[PIPELINE_NETWORK_FAILURE]\nstage=${stage}\nurl=${url}\nerrorName=${errorName}\nerrorMessage=${errorMessage}`
    );
  } else {
    console.error(
      `[PIPELINE_FAILURE]\nstage=${stage}\nstatus=${finalStatus}\nurl=${url}\nstatusText=${finalStatusText}\nresponseBody=${finalRespBody}\nerrorName=${errorName}\nerrorMessage=${errorMessage}`
    );
  }
}

/**
 * Parses any pipeline exception into a structured technical error.
 * NEVER masks HTTP 500, 422, 404, 401 as a generic network error.
 */
export function parsePipelineError(
  stage: PipelineStage,
  err: any,
  endpoint: string,
  requestId?: string
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
        userFacingMessage = `Backend service unavailable — HTTP ${httpStatus}: Processing server is restarting or under maintenance.`;
        break;
      default:
        userFacingMessage = `Backend returned HTTP ${httpStatus}: ${backendDetail || err.message || "Unknown HTTP error"}`;
        break;
    }
  } else if (err?.code === "ECONNABORTED") {
    userFacingMessage = `Connection timed out (ECONNABORTED): The operation took longer than the allocated timeout limit.`;
  } else if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
    // Check if offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      userFacingMessage = `Client Offline: Your device lost internet connectivity during ${stage}.`;
    } else {
      userFacingMessage = `Network Error on ${stage}: Failed to complete HTTP request to ${endpoint}. (Check backend reachability).`;
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
    responseBodyStr
  );

  return {
    stage,
    endpoint,
    httpStatus,
    errorName,
    errorMessage: userFacingMessage,
    technicalDetail: backendDetail || err?.message,
    responseBody: responseBodyStr,
    requestId: requestId || (responseData?.upload_id || responseData?.project_id || undefined),
    timestamp: now,
  };
}

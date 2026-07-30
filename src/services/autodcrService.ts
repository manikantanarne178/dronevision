import API from "../api";
import type {
  UploadResponse,
  ParseResult,
  DetectResponse,
  CalculateResponse,
  ValidateResponse,
  GreenBuildingResponse,
  AccessibilityResponse,
  ReportResponse,
  RuleItem,
  SystemMetrics,
  SubmissionHistoryItem,
  AutoDCRProject,
} from "../types/autodcr";

export class AutoDCRService {
  /**
   * Upload CAD/BIM drawing file (DXF, DWG, IFC, PDF)
   */
  static async uploadDrawing(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post<UploadResponse>(
      "/api/autodcr/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (event.total && onUploadProgress) {
            const pct = Math.round((event.loaded * 100) / event.total);
            onUploadProgress(pct);
          }
        },
      }
    );
    return response.data;
  }

  /**
   * Parse uploaded drawing file
   */
  static async parseDrawing(fileId: string): Promise<ParseResult> {
    const response = await API.post<ParseResult>(
      `/api/autodcr/parse?file_id=${encodeURIComponent(fileId)}`
    );
    return response.data;
  }

  /**
   * Run automatic spatial feature detection engine
   */
  static async detectFeatures(fileId: string): Promise<DetectResponse> {
    const response = await API.post<DetectResponse>(
      `/api/autodcr/detect?file_id=${encodeURIComponent(fileId)}`
    );
    return response.data;
  }

  /**
   * Calculate Area, Height, and Parking metrics
   */
  static async calculateMetrics(
    fileId: string,
    floorCount: number = 1
  ): Promise<CalculateResponse> {
    const response = await API.post<CalculateResponse>(
      `/api/autodcr/calculate?file_id=${encodeURIComponent(
        fileId
      )}&floor_count=${floorCount}`
    );
    return response.data;
  }

  /**
   * Validate metrics against municipal rule sets
   */
  static async validateFile(
    fileId: string,
    zone: string = "Residential",
    floorCount: number = 1
  ): Promise<ValidateResponse> {
    const response = await API.post<ValidateResponse>(
      `/api/autodcr/validate?file_id=${encodeURIComponent(
        fileId
      )}&zone=${encodeURIComponent(zone)}&floor_count=${floorCount}`
    );
    return response.data;
  }

  /**
   * Evaluate Green Building Compliance (GRIHA / IGBC / Municipal)
   */
  static async evaluateGreenBuilding(
    fileId: string,
    standard: string = "GRIHA"
  ): Promise<GreenBuildingResponse> {
    const response = await API.post<GreenBuildingResponse>(
      `/api/autodcr/green-building?file_id=${encodeURIComponent(
        fileId
      )}&standard=${encodeURIComponent(standard)}`
    );
    return response.data;
  }

  /**
   * Evaluate barrier-free accessibility rules
   */
  static async evaluateAccessibility(
    fileId: string
  ): Promise<AccessibilityResponse> {
    const response = await API.post<AccessibilityResponse>(
      `/api/autodcr/accessibility?file_id=${encodeURIComponent(fileId)}`
    );
    return response.data;
  }

  /**
   * Generate multi-format municipal compliance report
   */
  static async generateReport(
    fileId: string,
    format: string = "json",
    zone: string = "Residential"
  ): Promise<ReportResponse> {
    const response = await API.post<ReportResponse>(
      `/api/autodcr/report?file_id=${encodeURIComponent(
        fileId
      )}&format=${encodeURIComponent(format)}&zone=${encodeURIComponent(zone)}`
    );
    return response.data;
  }

  /**
   * Get active configurable municipal rule set
   */
  static async getRules(occupancy: string = "Residential"): Promise<RuleItem[]> {
    const response = await API.get<RuleItem[]>(
      `/api/autodcr/rules?occupancy=${encodeURIComponent(occupancy)}`
    );
    return response.data;
  }

  /**
   * Get system health and performance metrics
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await API.get<SystemMetrics>("/api/autodcr/metrics");
    return response.data;
  }

  /**
   * Get past project submission history
   */
  static async getSubmissionHistory(): Promise<{
    history: SubmissionHistoryItem[];
    total_submissions: number;
  }> {
    const response = await API.get<{
      history: SubmissionHistoryItem[];
      total_submissions: number;
    }>("/api/autodcr/history");
    return response.data;
  }

  /**
   * List all registered AutoDCR projects
   */
  static async listProjects(): Promise<{ projects: AutoDCRProject[] }> {
    const response = await API.get<{ projects: AutoDCRProject[] }>(
      "/api/autodcr/projects"
    );
    return response.data;
  }

  /**
   * Retrieve validation result by ID
   */
  static async getResult(id: string): Promise<any> {
    const response = await API.get(`/api/autodcr/results/${encodeURIComponent(id)}`);
    return response.data;
  }

  /**
   * Delete an AutoDCR project by ID
   */
  static async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const response = await API.delete<{ success: boolean; message: string }>(
      `/api/autodcr/projects/${encodeURIComponent(id)}`
    );
    return response.data;
  }
}

export default AutoDCRService;

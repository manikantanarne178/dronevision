import API, { ensureAuthToken } from "../api";

export interface DroneProjectBackend {
  project_id: string;
  name?: string;
  generated_at?: string;
  processing_time?: number;
  processing_time_seconds?: number;
  images_uploaded?: number;
  width?: number;
  length?: number;
  height?: number;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
  };
  ground_area?: number;
  surface_area?: number;
  volume?: number;
  vertices?: number;
  triangles?: number;
  model_url?: string;
  report_url?: string;
  status?: "COMPLETED" | "PROCESSING" | "FAILED" | "PENDING";
}

export interface DroneGPSLocation {
  image: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp?: string;
  camera?: string;
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export interface DroneGPSResponse {
  count: number;
  locations: DroneGPSLocation[];
}

export class DroneApiService {
  /**
   * Fetches real Drone projects from backend GET /api/projects/
   */
  static async listDroneProjects(): Promise<DroneProjectBackend[]> {
    await ensureAuthToken();
    const res = await API.get("/api/projects/");
    
    let rawList: any[] = [];
    if (res.data?.success && Array.isArray(res.data.projects)) {
      rawList = res.data.projects;
    } else if (Array.isArray(res.data)) {
      rawList = res.data;
    } else if (res.data?.projects && Array.isArray(res.data.projects)) {
      rawList = res.data.projects;
    }

    return rawList.map((p) => {
      const width = Number(p.dimensions?.width ?? p.width ?? 0);
      const length = Number(p.dimensions?.length ?? p.length ?? 0);
      const height = Number(p.dimensions?.height ?? p.height ?? 0);

      return {
        project_id: p.project_id || p.id || "PRJ_UNKNOWN",
        name: p.name || `Survey ${p.project_id || ""}`,
        generated_at: p.generated_at || p.created_at,
        processing_time: p.processing_time || p.processing_time_seconds,
        images_uploaded: p.images_uploaded ?? p.image_count ?? 0,
        width,
        length,
        height,
        dimensions: { width, length, height },
        ground_area: Number(p.ground_area ?? 0),
        surface_area: Number(p.surface_area ?? 0),
        volume: Number(p.volume ?? 0),
        vertices: Number(p.vertices ?? 0),
        triangles: Number(p.triangles ?? 0),
        model_url: p.model_url || `/api/projects/${p.project_id}/model`,
        report_url: p.report_url || `/api/projects/${p.project_id}/report`,
        status: p.model_url || p.vertices > 0 ? "COMPLETED" : "PROCESSING",
      };
    });
  }

  /**
   * Fetches detailed analytics for a single Drone project
   */
  static async getDroneAnalytics(projectId: string): Promise<DroneProjectBackend> {
    await ensureAuthToken();
    try {
      const res = await API.get(`/api/analytics/${projectId}`);
      const data = res.data;
      const width = Number(data.dimensions?.width ?? data.width ?? 0);
      const length = Number(data.dimensions?.length ?? data.length ?? 0);
      const height = Number(data.dimensions?.height ?? data.height ?? 0);

      return {
        project_id: data.project_id || projectId,
        name: data.name || `Survey ${projectId}`,
        generated_at: data.generated_at,
        processing_time: data.processing_time_seconds || data.processing_time,
        images_uploaded: data.images_uploaded ?? 0,
        width,
        length,
        height,
        dimensions: { width, length, height },
        ground_area: Number(data.ground_area ?? 0),
        surface_area: Number(data.surface_area ?? 0),
        volume: Number(data.volume ?? 0),
        vertices: Number(data.vertices ?? 0),
        triangles: Number(data.triangles ?? 0),
        model_url: `/api/projects/${projectId}/model`,
        report_url: `/api/projects/${projectId}/report`,
        status: "COMPLETED",
      };
    } catch {
      // Fallback: try getting project info from /api/projects/{projectId}
      const res = await API.get(`/api/projects/${projectId}`);
      const data = res.data;
      const width = Number(data.dimensions?.width ?? data.width ?? 0);
      const length = Number(data.dimensions?.length ?? data.length ?? 0);
      const height = Number(data.dimensions?.height ?? data.height ?? 0);

      return {
        project_id: data.project_id || projectId,
        name: data.name || `Survey ${projectId}`,
        generated_at: data.generated_at,
        processing_time: data.processing_time_seconds || data.processing_time,
        images_uploaded: data.images_uploaded ?? 0,
        width,
        length,
        height,
        dimensions: { width, length, height },
        ground_area: Number(data.ground_area ?? 0),
        surface_area: Number(data.surface_area ?? 0),
        volume: Number(data.volume ?? 0),
        vertices: Number(data.vertices ?? 0),
        triangles: Number(data.triangles ?? 0),
        model_url: `/api/projects/${projectId}/model`,
        report_url: `/api/projects/${projectId}/report`,
        status: "COMPLETED",
      };
    }
  }

  /**
   * Fetches GLB 3D model blob for a Drone project
   */
  static async getDroneModelBlob(projectId: string): Promise<{ blob: Blob; sizeMB: string }> {
    await ensureAuthToken();
    let response;
    try {
      response = await API.get(`/api/projects/${projectId}/model`, {
        responseType: "blob",
      });
    } catch {
      // Fallback to alternate model route
      response = await API.get(`/api/reconstruction/model/${projectId}`, {
        responseType: "blob",
      });
    }

    if (!response.data || response.data.size === 0) {
      throw new Error("3D model is not available for this project.");
    }

    const sizeMB = (response.data.size / (1024 * 1024)).toFixed(2);
    return { blob: response.data, sizeMB };
  }

  /**
   * Fetches GPS locations from backend /gps/
   */
  static async getDroneGPS(): Promise<DroneGPSResponse> {
    await ensureAuthToken();
    const res = await API.get("/gps/");
    return {
      count: res.data?.count || 0,
      locations: res.data?.locations || [],
    };
  }

  /**
   * Deletes a Drone project
   */
  static async deleteDroneProject(projectId: string): Promise<void> {
    await ensureAuthToken();
    await API.delete(`/api/projects/${projectId}`);
  }
}

export default DroneApiService;

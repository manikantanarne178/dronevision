import exifr from "exifr";

export interface DroneSurveyImage {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  timestamp?: string;
  previewUrl?: string;

  // Camera & Drone EXIF
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  aperture?: number;
  iso?: number;
  shutterSpeed?: string;
  droneMake?: string;
  droneModel?: string;

  // GNSS / IMU Telemetry
  hasGPS: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gpsAltitude?: number;
  relativeAltitude?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  gpsAccuracy?: number;
}

export interface SurveyBoundaryPoint {
  lat: number;
  lng: number;
}

export interface DroneSurvey {
  id: string;
  backendProjectId?: string;
  name: string;
  createdAt: string;
  imageCount: number;
  geotaggedImageCount: number;
  coordinateSystem: string;
  utmZone?: string;

  cameraInfo?: {
    make?: string;
    model?: string;
    focalLength?: string;
  };
  droneInfo?: {
    make?: string;
    model?: string;
  };

  images: DroneSurveyImage[];
  flightPath: Array<{
    lat: number;
    lng: number;
    alt: number;
    timestamp?: string;
    filename: string;
  }>;

  surveyBoundary: SurveyBoundaryPoint[];
  areaSqm: number;
  areaSqft: number;
  areaAcres: number;
  areaHectares: number;
  perimeterM: number;

  boundingBox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    widthM: number;
    lengthM: number;
  };

  elevation?: {
    minElevation: number;
    maxElevation: number;
    deltaElevation: number;
    avgElevation: number;
  };

  processingStatus:
    | "pending"
    | "extracting"
    | "uploading"
    | "reconstructing"
    | "completed"
    | "failed";
  reconstructionStatus: "pending" | "available" | "unavailable";
  modelUrl?: string;
  pointCloudUrl?: string;
  orthomosaicUrl?: string;
  processingTime?: number;
  warnings?: string[];
}

const STORAGE_KEY = "dronevision_surveys_v2";
const ACTIVE_SURVEY_KEY = "dronevision_active_survey_id";

// WGS84 Geodesic Calculations
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Distance between two points in meters using Haversine formula
export function haversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute UTM Zone from Longitude
export function getUTMZone(longitude: number, latitude: number): string {
  const zone = Math.floor((longitude + 180) / 6) + 1;
  const hemisphere = latitude >= 0 ? "N" : "S";
  return `UTM Zone ${zone}${hemisphere} (WGS84)`;
}

// Compute 2D Convex Hull (Monotone Chain algorithm) for Survey Footprint
export function computeConvexHull(
  points: Array<{ lat: number; lng: number }>
): SurveyBoundaryPoint[] {
  if (points.length < 3) return points;

  const sorted = [...points].sort((a, b) =>
    a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng
  );

  const crossProduct = (
    o: { lat: number; lng: number },
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ) => (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);

  const lower: Array<{ lat: number; lng: number }> = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Array<{ lat: number; lng: number }> = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Compute polygon area in square meters using Spherical Excess / Shoelace formula
export function computeSphericalPolygonArea(
  points: SurveyBoundaryPoint[]
): number {
  if (points.length < 3) return 0;

  const R = 6378137; // WGS84 Earth Equatorial Radius in meters
  let total = 0;

  // Project coordinates to meters relative to center
  const centerLat =
    points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const centerLng =
    points.reduce((sum, p) => sum + p.lng, 0) / points.length;

  const xyPoints = points.map((p) => {
    const x =
      toRadians(p.lng - centerLng) *
      R *
      Math.cos(toRadians(centerLat));
    const y = toRadians(p.lat - centerLat) * R;
    return { x, y };
  });

  // Standard Shoelace in Cartesian meters
  for (let i = 0; i < xyPoints.length; i++) {
    const j = (i + 1) % xyPoints.length;
    total += xyPoints[i].x * xyPoints[j].y;
    total -= xyPoints[j].x * xyPoints[i].y;
  }

  return Math.abs(total / 2);
}

// Compute perimeter in meters
export function computePolygonPerimeter(points: SurveyBoundaryPoint[]): number {
  if (points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    perimeter += haversineDistanceM(
      points[i].lat,
      points[i].lng,
      points[j].lat,
      points[j].lng
    );
  }
  return perimeter;
}

// Extract EXIF & GPS Metadata from single image file using exifr
export async function extractImageMetadata(
  file: File
): Promise<DroneSurveyImage> {
  const id = `img_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  let previewUrl = "";

  try {
    previewUrl = URL.createObjectURL(file);
  } catch (e) {
    console.warn("Could not create object URL for preview:", e);
  }

  const result: DroneSurveyImage = {
    id,
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type || "image/jpeg",
    hasGPS: false,
    previewUrl,
  };

  try {
    const parsed = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: false,
      jfif: false,
      gps: true,
    });

    if (parsed) {
      if (parsed.ImageWidth) result.width = parsed.ImageWidth;
      if (parsed.ImageHeight) result.height = parsed.ImageHeight;
      if (parsed.DateTimeOriginal) {
        result.timestamp = new Date(parsed.DateTimeOriginal).toISOString();
      } else if (parsed.CreateDate) {
        result.timestamp = new Date(parsed.CreateDate).toISOString();
      }

      // Camera
      if (parsed.Make) result.cameraMake = String(parsed.Make).trim();
      if (parsed.Model) result.cameraModel = String(parsed.Model).trim();
      if (parsed.LensModel) result.lensModel = String(parsed.LensModel).trim();
      if (parsed.FocalLength) result.focalLength = Number(parsed.FocalLength);
      if (parsed.FNumber) result.aperture = Number(parsed.FNumber);
      if (parsed.ISO) result.iso = Number(parsed.ISO);
      if (parsed.ExposureTime) {
        result.shutterSpeed =
          parsed.ExposureTime < 1
            ? `1/${Math.round(1 / parsed.ExposureTime)}`
            : `${parsed.ExposureTime}s`;
      }

      // Drone specific checks (DJI, Autel, Parrot, Skydio)
      const makeModel = `${result.cameraMake || ""} ${
        result.cameraModel || ""
      }`.toLowerCase();
      if (makeModel.includes("dji") || parsed.FlightYawDegree !== undefined) {
        result.droneMake = "DJI";
        result.droneModel = result.cameraModel || "DJI Enterprise UAV";
      } else if (makeModel.includes("autel")) {
        result.droneMake = "Autel Robotics";
        result.droneModel = result.cameraModel || "EVO II Enterprise";
      } else if (makeModel.includes("parrot")) {
        result.droneMake = "Parrot";
        result.droneModel = result.cameraModel || "Anafi USA";
      }

      // Orientation / Gimbal
      if (parsed.FlightYawDegree !== undefined)
        result.heading = Number(parsed.FlightYawDegree);
      else if (parsed.GPSImgDirection !== undefined)
        result.heading = Number(parsed.GPSImgDirection);

      if (parsed.FlightPitchDegree !== undefined)
        result.pitch = Number(parsed.FlightPitchDegree);
      if (parsed.FlightRollDegree !== undefined)
        result.roll = Number(parsed.FlightRollDegree);

      // GPS Coordinates
      if (
        parsed.latitude !== undefined &&
        parsed.longitude !== undefined &&
        !isNaN(parsed.latitude) &&
        !isNaN(parsed.longitude)
      ) {
        result.hasGPS = true;
        result.latitude = Number(parsed.latitude);
        result.longitude = Number(parsed.longitude);
        if (parsed.altitude !== undefined) {
          result.altitude = Number(parsed.altitude);
          result.gpsAltitude = Number(parsed.altitude);
        }
        if (parsed.RelativeAltitude !== undefined) {
          result.relativeAltitude = Number(parsed.RelativeAltitude);
        }
      }
    }
  } catch (err) {
    console.warn(`EXIF extraction skipped for ${file.name}:`, err);
  }

  return result;
}

// Build DroneSurvey Mission from Ingested Files
export async function buildSurveyFromFiles(
  files: File[],
  surveyName?: string
): Promise<DroneSurvey> {
  const images: DroneSurveyImage[] = [];

  for (const file of files) {
    const meta = await extractImageMetadata(file);
    images.push(meta);
  }

  const geotaggedImages = images.filter(
    (img) =>
      img.hasGPS && img.latitude !== undefined && img.longitude !== undefined
  );

  // Flight Path ordered by timestamp (or array order)
  const sortedGeotagged = [...geotaggedImages].sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return 0;
  });

  const flightPath = sortedGeotagged.map((img) => ({
    lat: img.latitude!,
    lng: img.longitude!,
    alt: img.altitude ?? 0,
    timestamp: img.timestamp,
    filename: img.filename,
  }));

  // Geographic Footprint & Boundary
  let surveyBoundary: SurveyBoundaryPoint[] = [];
  let areaSqm = 0;
  let perimeterM = 0;
  let utmZone = "WGS84 Geographic";

  let boundingBox: DroneSurvey["boundingBox"] = undefined;
  let elevation: DroneSurvey["elevation"] = undefined;

  if (geotaggedImages.length >= 3) {
    const rawCoords = geotaggedImages.map((img) => ({
      lat: img.latitude!,
      lng: img.longitude!,
    }));

    surveyBoundary = computeConvexHull(rawCoords);
    areaSqm = computeSphericalPolygonArea(surveyBoundary);
    perimeterM = computePolygonPerimeter(surveyBoundary);

    const lats = geotaggedImages.map((i) => i.latitude!);
    const lngs = geotaggedImages.map((i) => i.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const widthM = haversineDistanceM(minLat, minLng, minLat, maxLng);
    const lengthM = haversineDistanceM(minLat, minLng, maxLat, minLng);

    boundingBox = { minLat, maxLat, minLng, maxLng, widthM, lengthM };
    utmZone = getUTMZone(minLng, minLat);
  } else if (geotaggedImages.length > 0) {
    utmZone = getUTMZone(
      geotaggedImages[0].longitude!,
      geotaggedImages[0].latitude!
    );
  }

  // Elevation analysis
  const altitudes = geotaggedImages
    .map((i) => i.altitude)
    .filter((a): a is number => a !== undefined);

  if (altitudes.length > 0) {
    const minElevation = Math.min(...altitudes);
    const maxElevation = Math.max(...altitudes);
    const avgElevation =
      altitudes.reduce((s, a) => s + a, 0) / altitudes.length;
    elevation = {
      minElevation,
      maxElevation,
      deltaElevation: maxElevation - minElevation,
      avgElevation,
    };
  }

  // Camera & Drone summary
  const sampleCamera = images.find((i) => i.cameraMake || i.cameraModel);
  const sampleDrone = images.find((i) => i.droneMake || i.droneModel);

  const cameraInfo = sampleCamera
    ? {
        make: sampleCamera.cameraMake,
        model: sampleCamera.cameraModel,
        focalLength: sampleCamera.focalLength
          ? `${sampleCamera.focalLength} mm`
          : undefined,
      }
    : undefined;

  const droneInfo = sampleDrone
    ? {
        make: sampleDrone.droneMake,
        model: sampleDrone.droneModel,
      }
    : undefined;

  const warnings: string[] = [];
  if (geotaggedImages.length === 0) {
    warnings.push("GPS metadata unavailable. Coordinates could not be extracted from imagery.");
  } else if (geotaggedImages.length < 3) {
    warnings.push(
      "Insufficient geotagged images (< 3) to calculate reliable survey footprint area."
    );
  }

  const id = `survey_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  const now = new Date().toISOString();

  const survey: DroneSurvey = {
    id,
    name:
      surveyName ||
      `Drone Mission ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    createdAt: now,
    imageCount: images.length,
    geotaggedImageCount: geotaggedImages.length,
    coordinateSystem: "WGS84",
    utmZone,
    cameraInfo,
    droneInfo,
    images,
    flightPath,
    surveyBoundary,
    areaSqm: Math.round(areaSqm * 100) / 100,
    areaSqft: Math.round(areaSqm * 10.7639 * 100) / 100,
    areaAcres: Math.round((areaSqm / 4046.86) * 1000) / 1000,
    areaHectares: Math.round((areaSqm / 10000) * 1000) / 1000,
    perimeterM: Math.round(perimeterM * 100) / 100,
    boundingBox,
    elevation,
    processingStatus: "completed",
    reconstructionStatus: "pending",
    warnings,
  };

  return survey;
}

// Storage Operations
export function loadStoredSurveys(): DroneSurvey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load surveys from localStorage:", err);
    return [];
  }
}

export function saveStoredSurveys(surveys: DroneSurvey[]): void {
  try {
    // Avoid storing base64 blobs in localStorage if too large
    const sanitized = surveys.map((s) => ({
      ...s,
      images: s.images.map((img) => ({
        ...img,
        previewUrl: undefined, // Free memory
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error("Failed to persist surveys to localStorage:", err);
  }
}

export function getStoredActiveSurveyId(): string | null {
  return localStorage.getItem(ACTIVE_SURVEY_KEY);
}

export function setStoredActiveSurveyId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_SURVEY_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_SURVEY_KEY);
  }
}

// Export Survey to Standard DXF File
export function generateSurveyDXF(survey: DroneSurvey): Blob {
  const lines: string[] = [];

  // DXF Header
  lines.push("0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1015", "0", "ENDSEC");

  // DXF Tables / Layers
  lines.push("0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER", "70", "5");
  
  // Layer: SURVEY_BOUNDARY
  lines.push("0", "LAYER", "2", "SURVEY_BOUNDARY", "70", "0", "62", "1", "6", "CONTINUOUS");
  // Layer: FLIGHT_PATH
  lines.push("0", "LAYER", "2", "FLIGHT_PATH", "70", "0", "62", "4", "6", "CONTINUOUS");
  // Layer: PHOTO_POINTS
  lines.push("0", "LAYER", "2", "PHOTO_POINTS", "70", "0", "62", "3", "6", "CONTINUOUS");
  // Layer: MEASUREMENTS
  lines.push("0", "LAYER", "2", "MEASUREMENTS", "70", "0", "62", "7", "6", "CONTINUOUS");
  
  lines.push("0", "ENDTAB", "0", "ENDSEC");

  // DXF Entities
  lines.push("0", "SECTION", "2", "ENTITIES");

  // Origin shift to local metric coordinates
  const originLat = survey.surveyBoundary[0]?.lat || survey.flightPath[0]?.lat || 0;
  const originLng = survey.surveyBoundary[0]?.lng || survey.flightPath[0]?.lng || 0;
  const R = 6378137;

  const toLocalXY = (lat: number, lng: number) => {
    const x = toRadians(lng - originLng) * R * Math.cos(toRadians(originLat));
    const y = toRadians(lat - originLat) * R;
    return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 };
  };

  // Add Survey Boundary Polyline
  if (survey.surveyBoundary.length >= 3) {
    lines.push(
      "0", "LWPOLYLINE",
      "8", "SURVEY_BOUNDARY",
      "90", survey.surveyBoundary.length.toString(),
      "70", "1" // Closed
    );
    for (const pt of survey.surveyBoundary) {
      const xy = toLocalXY(pt.lat, pt.lng);
      lines.push("10", xy.x.toString(), "20", xy.y.toString());
    }
  }

  // Add Flight Path Polyline
  if (survey.flightPath.length >= 2) {
    lines.push(
      "0", "LWPOLYLINE",
      "8", "FLIGHT_PATH",
      "90", survey.flightPath.length.toString(),
      "70", "0" // Open
    );
    for (const pt of survey.flightPath) {
      const xy = toLocalXY(pt.lat, pt.lng);
      lines.push("10", xy.x.toString(), "20", xy.y.toString());
    }
  }

  // Add Photo Points / Waypoints
  survey.flightPath.forEach((pt, idx) => {
    const xy = toLocalXY(pt.lat, pt.lng);
    lines.push(
      "0", "POINT",
      "8", "PHOTO_POINTS",
      "10", xy.x.toString(),
      "20", xy.y.toString(),
      "30", (pt.alt || 0).toString()
    );

    // Text label
    lines.push(
      "0", "TEXT",
      "8", "PHOTO_POINTS",
      "10", (xy.x + 1.0).toString(),
      "20", (xy.y + 1.0).toString(),
      "40", "1.5",
      "1", `P#${idx + 1} (${pt.filename})`
    );
  });

  lines.push("0", "ENDSEC", "0", "EOF");

  return new Blob([lines.join("\n")], { type: "application/dxf" });
}

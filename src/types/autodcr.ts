export interface UploadResponse {
  filename: string;
  path: string;
  status: string;
}

export interface EntityItem {
  type: string;
  layer: string;
  start?: number[];
  end?: number[];
}

export interface ParseResult {
  file_id: string;
  status: string;
  filename?: string;
  file_type?: string;
  layers: string[];
  entities: EntityItem[];
  blocks?: string[];
  text?: string[];
  dimensions?: Array<{ text?: string; value?: number; layer?: string }>;
  coordinates?: Array<{ x: number; y: number; z?: number }>;
  logs?: string[];
}

export interface DetectionFeature {
  type: string;
  detected: boolean;
  confidence: number;
  details?: string;
  area_sqm?: number;
}

export type DetectionResults = Record<string, DetectionFeature | any>;

export interface DetectResponse {
  file_id: string;
  detection_results: DetectionResults;
}

export interface AreasMetric {
  plot_area: number;
  ground_coverage_area: number;
  built_up_area: number;
  fsi_achieved: number;
  fsi_permissible: number;
  far_achieved: number;
  open_area: number;
  landscape_area: number;
}

export interface HeightsMetric {
  total_height: number;
  floor_height: number;
  floor_count: number;
  stilt_height?: number;
  parapet_height?: number;
}

export interface ParkingMetric {
  required_slots: number;
  provided_slots: number;
  visitor_slots?: number;
  handicapped_slots?: number;
  ramp_slope_ratio?: number;
  status: string;
}

export interface CalculateResponse {
  file_id: string;
  areas: AreasMetric;
  heights: HeightsMetric;
  parking: ParkingMetric;
}

export interface RuleViolation {
  rule_name: string;
  category: string;
  expected_value: string | number;
  actual_value: string | number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  suggestion?: string;
  clause?: string;
}

export interface ValidationCompliance {
  overall_status: 'PASS' | 'FAIL' | 'CONDITIONAL';
  compliance_percentage: number;
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  warning_rules: number;
}

export interface GreenBuildingScore {
  solar_score: number;
  water_score: number;
  landscape_score: number;
  energy_score: number;
  waste_score: number;
  overall_rating: string;
  compliance_percentage: number;
  recommendations: string[];
}

export interface AccessibilityScore {
  wheelchair_route: boolean;
  accessible_entrance: boolean;
  ramp_compliance: boolean;
  lift_accessibility: boolean;
  door_width_mm: number;
  corridor_width_mm: number;
  accessible_toilets: boolean;
  handrails_provided: boolean;
  tactile_path: boolean;
  compliance_percentage: number;
}

export interface ValidateResponse {
  file_id: string;
  zone: string;
  validations: RuleViolation[];
  compliance: ValidationCompliance;
  green_building: GreenBuildingScore;
  accessibility: AccessibilityScore;
}

export interface GreenBuildingResponse {
  file_id: string;
  green_building: GreenBuildingScore;
}

export interface AccessibilityResponse {
  file_id: string;
  accessibility: AccessibilityScore;
}

export interface ReportResponse {
  project_id: string;
  generated_at?: string;
  format: string;
  download_url?: string;
  summary: {
    overall_status: string;
    compliance_percentage: number;
    plot_area: number;
    built_up_area: number;
    fsi: number;
  };
  details?: any;
}

export interface RuleItem {
  id: string;
  rule_name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Mixed Use';
  min_value?: string | number;
  max_value?: string | number;
  unit?: string;
  description: string;
  clause_reference: string;
  is_mandatory: boolean;
}

export interface SystemMetrics {
  engine_version: string;
  status: string;
  supported_formats: string[];
  supported_zones: string[];
  total_processed_today?: number;
  average_processing_time_sec?: number;
  server_load_pct?: number;
}

export interface SubmissionHistoryItem {
  id: string;
  file_id: string;
  filename: string;
  uploaded_at: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW';
  zone: string;
  compliance_percentage: number;
  applicant_name?: string;
}

export interface AutoDCRProject {
  id: string;
  name: string;
  file_id: string;
  file_type: string;
  created_at: string;
  updated_at: string;
  status: 'DRAFT' | 'PARSED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  zone: string;
  owner_name?: string;
  plot_number?: string;
}

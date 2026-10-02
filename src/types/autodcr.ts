export interface UploadResponse {
  success?: boolean;
  filename?: string;
  name?: string;
  path?: string;
  file_path?: string;
  file_id?: string;
  project_id?: string;
  project_code?: string;
  stored_filename?: string;
  file_type?: string;
  file_size?: number;
  checksum?: string;
  zone?: string;
  status: string;
  uploaded_at?: string;
  created_at?: string;
  analysis?: any;
  error?: string;
}

export interface EntityItem {
  type: string;
  layer: string;
  start?: number[];
  end?: number[];
  points?: number[][];
  text?: string;
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
  texts?: any[];
  dimensions?: Array<{ text?: string; value?: number; layer?: string; measurement?: number }>;
  coordinates?: Array<{ x: number; y: number; z?: number }>;
  logs?: string[];
}

export interface DetectionFeature {
  type?: string;
  detected: boolean;
  confidence: number;
  details?: string;
  area_sqm?: number;
  layer?: string;
}

export type DetectionResults = Record<string, DetectionFeature | any>;

export interface DetectResponse {
  file_id: string;
  detection_results: DetectionResults;
}

export interface AreasMetric {
  plot_area: number;
  ground_coverage_area: number;
  ground_coverage_pct?: number;
  built_up_area: number;
  fsi_achieved: number;
  fsi_permissible: number;
  far_achieved: number;
  open_area: number;
  landscape_area: number;
  far?: number;
}

export interface HeightsMetric {
  total_height: number;
  building_height?: number;
  floor_height: number;
  floor_count: number;
  number_of_floors?: number;
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
  required_car_parking?: number;
  available_car_parking?: number;
}

export interface CalculateResponse {
  file_id: string;
  areas: AreasMetric;
  heights: HeightsMetric;
  parking: ParkingMetric;
}

export interface RuleViolation {
  rule_name: string;
  category?: string;
  expected_value?: string | number;
  actual_value?: string | number;
  expected?: string | number;
  actual?: string | number;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'REVIEW_REQUIRED' | string;
  suggestion?: string;
  reason?: string;
  severity?: string;
  clause?: string;
  reference_code?: string;
}

export interface ValidationCompliance {
  overall_status: 'PASS' | 'FAIL' | 'CONDITIONAL';
  compliance_percentage: number;
  compliance_score?: number;
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
  overall_green_score?: number;
  total_score?: number;
  recommendations: string[];
}

export interface AccessibilityCheckItem {
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  required: string;
  actual: string;
}

export interface AccessibilityScore {
  wheelchair_route?: boolean;
  accessible_entrance?: boolean;
  ramp_compliance?: boolean;
  lift_accessibility?: boolean;
  door_width_mm?: number;
  corridor_width_mm?: number;
  accessible_toilets?: boolean;
  handrails_provided?: boolean;
  tactile_path?: boolean;
  compliance_percentage?: number;
  accessibility_score_percentage?: number;
  overall_accessibility_status?: string;
  passed_checks?: number;
  total_checks?: number;
  check_details?: AccessibilityCheckItem[];
  recommendations?: string[];
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

export interface ScrutinyReportData {
  project: {
    id: string;
    project_id: string;
    project_code?: string;
    name: string;
    filename: string;
    original_filename: string;
    stored_filename?: string;
    file_type: string;
    file_size?: number;
    checksum?: string;
    zone: string;
    status: string;
    processing_status?: string;
    applicant_name?: string;
    owner_name?: string;
    plot_number?: string;
    uploaded_at?: string;
    created_at?: string;
    updated_at?: string;
  };
  file: {
    original_name: string;
    stored_name?: string;
    file_type?: string;
    file_size?: number;
    checksum?: string;
    mime_type?: string;
  };
  scrutiny: {
    overall_status: string;
    compliance_score: number;
    risk_level: string;
    pass_count: number;
    fail_count: number;
    warning_count: number;
  };
  analysis: {
    areas?: Record<string, any>;
    heights?: Record<string, any>;
    parking?: Record<string, any>;
    detection_results?: Record<string, any>;
    green_building?: any;
    accessibility?: any;
  };
  metrics: {
    plot_area?: number | null;
    plot_area_unit?: string;
    built_up_area?: number | null;
    built_up_area_unit?: string;
    fsi?: number | null;
    far?: number | null;
    ground_coverage_pct?: number | null;
    building_height?: number | null;
    road_width?: number | null;
    setbacks?: any;
    car_parking?: number | null;
    open_area?: number | null;
    open_space_area?: number | null;
    [key: string]: any;
  };
  rules: RuleViolation[];
  validations: RuleViolation[];
  violations: RuleViolation[];
  summary: {
    total_rules: number;
    passed: number;
    failed: number;
    review_required: number;
    compliance_percentage: number;
    overall_status: string;
    plot_area?: number | null;
    built_up_area?: number | null;
    fsi?: number | null;
  };
  recommendations?: string[];
  generated_at?: string;
  metadata?: {
    engine_version?: string;
    scrutiny_authority?: string;
    is_electronically_authenticated?: boolean;
    [key: string]: any;
  };
}

export interface ReportResponse {
  project_id: string;
  report_id?: string;
  generated_at?: string;
  uploaded_at?: string;
  analyzed_at?: string;
  format?: string;
  download_url?: string;
  summary?: {
    overall_status?: string;
    compliance_percentage?: number;
    plot_area?: number | null;
    built_up_area?: number | null;
    fsi?: number | null;
    total_rules?: number;
    passed?: number;
    failed?: number;
    review_required?: number;
  };
  project?: any;
  file?: any;
  scrutiny?: any;
  analysis?: any;
  metrics?: any;
  rules?: RuleViolation[];
  validations?: RuleViolation[];
  violations?: RuleViolation[];
  rule_validation_table?: RuleViolation[];
  recommendations?: string[];
  details?: any;
}

export interface RuleItem {
  id: string;
  rule_name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Mixed Use' | string;
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
  total_projects?: number;
  total_processed_today?: number;
  total_drawings?: number;
  passed_count?: number;
  review_count?: number;
  rejected_count?: number;
  average_processing_time_sec?: number;
  server_load_pct?: number;
}

export interface SubmissionHistoryItem {
  id: string;
  file_id: string;
  filename: string;
  uploaded_at: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | string;
  zone: string;
  compliance_percentage: number;
  applicant_name?: string;
}

export interface AutoDCRProject {
  id: string;
  project_id?: string;
  project_code?: string;
  name: string;
  filename?: string;
  file_name?: string;
  original_filename?: string;
  stored_filename?: string;
  file_id: string;
  file_type: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  uploaded_at?: string;
  status: 'DRAFT' | 'PARSED' | 'VALIDATED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'FILE_MISSING' | string;
  processing_status?: string;
  is_file_available?: boolean;
  zone: string;
  applicant_name?: string;
  owner_name?: string;
  plot_number?: string;
  analysis?: any;
  validations?: any[];
  compliance_report?: any;
}

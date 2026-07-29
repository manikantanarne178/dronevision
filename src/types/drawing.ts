export interface Entity {
  type: string;
  layer: string;
  start?: number[];
  end?: number[];
}

export interface ParsedData {
  layers: string[];
  entities: Entity[];
}

export interface Rule {
  rule: string;
  status: string;
  reason?: string;
}

export interface DrawingResponse {
  drawing_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  uploaded_at: string | null;
  status: string;

  parsed_data: ParsedData;

  polygon_analysis: any[];

  plot: any;

  building: any;

  rules: Rule[];
}
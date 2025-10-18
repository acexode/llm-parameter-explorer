export interface Experiment {
  id: string;
  prompt: string;
  created_at: string;
}

export interface MetricDetail {
  score: number;
  explanation: string;
}

export interface QualityMetrics {
  coherence: MetricDetail;
  lexicalDiversity: MetricDetail;
  completeness: MetricDetail;
  readability: MetricDetail;
  lengthAppropriate: MetricDetail;
  overallScore: number;
}

export interface Response {
  id: string;
  experiment_id: string;
  temperature: number;
  top_p: number;
  content: string;
  metrics: QualityMetrics;
  created_at: string;
}

export interface ExperimentWithResponses extends Experiment {
  responses: Response[];
}

export interface GenerateRequest {
  prompt: string;
  temperatureMin: number;
  temperatureMax: number;
  topPMin: number;
  topPMax: number;
  variations: number;
}

export interface GenerateResponse {
  experiment: Experiment;
  responses: Response[];
}


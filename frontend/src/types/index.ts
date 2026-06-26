export interface ProcessingResult {
  blob: Blob;
  url: string;
  model?: string;
  inferenceTime?: number;
}

export interface BackgroundOption {
  type: "none" | "color" | "gradient" | "image" | "blur";
  color?: string;
  gradientColors?: string[];
  blurStrength?: number;
}

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export interface JobStatus {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result_url?: string;
  error?: string;
}

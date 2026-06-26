const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function removeBackground(
  file: File,
  options?: {
    preserveShadows?: boolean;
    edgeRefinement?: boolean;
    outputFormat?: string;
    highResolution?: boolean;
  }
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("preserve_shadows", String(options?.preserveShadows ?? false));
  formData.append("edge_refinement", String(options?.edgeRefinement ?? true));
  formData.append("output_format", options?.outputFormat ?? "png");
  formData.append("high_resolution", String(options?.highResolution ?? true));

  const response = await fetch(`${API_URL}/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Background removal failed");
  }

  return response.blob();
}

export async function replaceBackground(
  file: File,
  options: {
    backgroundType: string;
    color?: { r: number; g: number; b: number };
    blurStrength?: number;
    preserveShadows?: boolean;
  }
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("background_type", options.backgroundType);
  if (options.color) {
    formData.append("color_r", String(options.color.r));
    formData.append("color_g", String(options.color.g));
    formData.append("color_b", String(options.color.b));
  }
  if (options.blurStrength !== undefined) {
    formData.append("blur_strength", String(options.blurStrength));
  }
  formData.append("preserve_shadows", String(options.preserveShadows ?? false));

  const response = await fetch(`${API_URL}/replace-background`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Background replacement failed");
  }

  return response.blob();
}

export async function batchRemoveBackground(
  files: File[],
  options?: {
    preserveShadows?: boolean;
    edgeRefinement?: boolean;
    outputFormat?: string;
  }
): Promise<Blob> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("preserve_shadows", String(options?.preserveShadows ?? false));
  formData.append("edge_refinement", String(options?.edgeRefinement ?? true));
  formData.append("output_format", options?.outputFormat ?? "png");

  const response = await fetch(`${API_URL}/batch-remove`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Batch processing failed");
  }

  return response.blob();
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const baseUrl = API_URL.replace("/api/v1", "");
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

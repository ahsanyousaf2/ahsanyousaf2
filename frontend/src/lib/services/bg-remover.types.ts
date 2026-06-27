export interface BgRemoverService {
  /** Remove background from an image, return a PNG blob */
  removeBackground(imageBuffer: ArrayBuffer, fileName?: string): Promise<ArrayBuffer>;
}

/** Known service providers */
export type BgRemoverProvider = "removebg" | "self-hosted";

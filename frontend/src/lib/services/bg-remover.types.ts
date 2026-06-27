export interface BgRemoverService {
  removeBackground(imageBuffer: ArrayBuffer, fileName?: string): Promise<ArrayBuffer>;
}

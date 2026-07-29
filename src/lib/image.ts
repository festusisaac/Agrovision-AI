/** Downscale a data URL image to a JPEG of at most maxDim on its longest side. */
export function resizeImage(dataUrl: string, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/** Resize for sending to the diagnosis API — plenty of detail for disease/pest ID, much faster to upload. */
export function resizeForDiagnosis(dataUrl: string): Promise<string> {
  return resizeImage(dataUrl, 1024, 0.85);
}

/** Small thumbnail, safe for localStorage. */
export function createThumbnail(dataUrl: string): Promise<string> {
  return resizeImage(dataUrl, 240, 0.6);
}

export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Extracts the cropped region (in source-image pixel coordinates) as a new JPEG data URL. */
export function getCroppedImage(dataUrl: string, crop: CropPixels): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

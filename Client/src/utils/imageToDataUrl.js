// Downscales an uploaded image through a canvas before it's sent to the
// backend as a data: URL — a raw phone screenshot can be several MB;
// capping the longest side keeps the request small while staying easily
// legible for whoever verifies the payment later.
const MAX_DIM = 1200;

export async function imageToDataUrl(file, { maxDim = MAX_DIM, quality = 0.82 } = {}) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close?.();
  }
}

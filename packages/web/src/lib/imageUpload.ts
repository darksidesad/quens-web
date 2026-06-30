const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2048;

function toJpegName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'imagen';
  return `${base}.jpg`;
}

function scaleDimensions(width: number, height: number, maxDim: number): { width: number; height: number } {
  if (width <= maxDim && height <= maxDim) return { width, height };
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      type,
      quality,
    );
  });
}

async function compressToJpeg(file: File): Promise<File> {
  const img = await loadImage(file);
  const { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight, MAX_DIMENSION);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');
  ctx.drawImage(img, 0, 0, width, height);

  for (const quality of [0.88, 0.75, 0.6]) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_BYTES) {
      return new File([blob], toJpegName(file.name), { type: 'image/jpeg' });
    }
  }

  throw new Error('Imagen muy pesada incluso después de comprimir. Prueba con otra más pequeña.');
}

/** Comprime y normaliza imágenes del móvil antes de subirlas al servidor. */
export async function prepareImageForUpload(file: File): Promise<File> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || ext === 'heic' || ext === 'heif';

  if (ALLOWED_TYPES.has(file.type) && file.size <= MAX_BYTES && !isHeic) {
    return file;
  }

  try {
    return await compressToJpeg(file);
  } catch {
    if (isHeic) {
      throw new Error('Fotos HEIC de iPhone no son compatibles. Cambia a JPG en Ajustes → Cámara → Formatos.');
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error('Formato no válido. Usa JPG, PNG o WEBP.');
    }
    throw new Error('No se pudo procesar la imagen. Prueba con otra foto.');
  }
}

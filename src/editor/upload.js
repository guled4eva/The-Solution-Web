/** Reads a file (or blob) as a data: URL. */
function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const MAX_SIDE = 2000;
const MAX_BYTES = 1.5 * 1024 * 1024;

/**
 * Makes large photos smaller before upload (max 2000 px, ~1.5 MB), so the
 * website stays fast. Small images and GIFs are uploaded unchanged.
 * Returns { name, dataUrl }.
 */
export async function prepareUpload(file) {
  const original = await readAsDataUrl(file);
  const isResizable = /^image\/(jpeg|png|webp)$/.test(file.type);
  if (!isResizable) return { name: file.name, dataUrl: original };

  let img;
  try {
    img = await loadImage(original);
  } catch {
    return { name: file.name, dataUrl: original };
  }
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_SIDE && file.size <= MAX_BYTES) return { name: file.name, dataUrl: original };

  const scale = Math.min(1, MAX_SIDE / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const g = canvas.getContext("2d");
  const keepAlpha = file.type !== "image/jpeg";
  if (!keepAlpha) {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  g.drawImage(img, 0, 0, canvas.width, canvas.height);

  const tryType = keepAlpha ? "image/webp" : "image/jpeg";
  let dataUrl = canvas.toDataURL(tryType, 0.85);
  let ext = keepAlpha ? "webp" : "jpg";
  if (!dataUrl.startsWith(`data:${tryType}`)) {
    // Browser can't make WebP (older Safari) – use PNG
    dataUrl = canvas.toDataURL("image/png");
    ext = "png";
  }
  const base = file.name.replace(/\.[^.]+$/, "");
  return { name: `${base}.${ext}`, dataUrl };
}

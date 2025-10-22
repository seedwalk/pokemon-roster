type Options = {
    maxDimension?: number;   // downscale para rendimiento (px). Default 200
    sampleStep?: number;     // muestreo (1 = todos los píxeles). Default 2
    quantBits?: number;      // bits por canal para cuantización. Default 4 (12-bit)
    asGradient?: boolean;    // true => devuelve gradient, false => color sólido. Default true
  };
  
  const defaults: Required<Options> = {
    maxDimension: 200,
    sampleStep: 2,
    quantBits: 4,
    asGradient: true,
  };
  
  function toHex(n: number) {
    return n.toString(16).padStart(2, "0");
  }
  function rgbToHex(r: number, g: number, b: number) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function clamp(n: number, a = 0, b = 255) {
    return Math.max(a, Math.min(b, Math.round(n)));
  }
  function quantKey(r: number, g: number, b: number, bits: number) {
    const s = 8 - bits;
    return ((r >> s) << (bits * 2)) | ((g >> s) << bits) | (b >> s);
  }
  function darkenHex(hex: string, amount = 0.18) {
    // oscurece en HSL para hacer un segundo color del gradiente
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
  
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const newL = Math.max(0, l - amount);
    function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
    const p = 2 * newL - q;
    const R = clamp(hue2rgb(p, q, h + 1 / 3) * 255);
    const G = clamp(hue2rgb(p, q, h) * 255);
    const B = clamp(hue2rgb(p, q, h - 1 / 3) * 255);
    return rgbToHex(R, G, B);
  }
  
  /**
   * Calcula la luminosidad relativa de un color hex según WCAG.
   * Retorna un valor entre 0 (negro) y 1 (blanco).
   */
  function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
  
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  }

  /**
   * Determina si el texto debe ser negro o blanco basándose en el color de fondo.
   * Retorna '#000000' para texto negro o '#ffffff' para texto blanco.
   */
  export function getContrastColor(hex: string): string {
    const luminance = getLuminance(hex);
    // Si la luminosidad es mayor a 0.5, usar texto oscuro; si no, texto claro
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * Calcula el color dominante de una imagen remota y devuelve un background CSS.
   * Si asGradient=true, devuelve un linear-gradient; si no, un color sólido (#rrggbb).
   * IMPORTANTE: la URL debe permitir CORS para poder leer el canvas.
   */
  export async function getBackgroundFromImageURL(
    url: string,
    options?: Options
  ): Promise<string> {
    const opts = { ...defaults, ...(options || {}) };
  
    const img = await loadImage(url);
    const { dominantHex } = extractDominant(img, opts);
  
    if (opts.asGradient) {
      const darker = darkenHex(dominantHex, 0.22);
      // gradiente suave vertical (podés cambiar dirección)
      return `linear-gradient(180deg, ${dominantHex} 0%, ${darker} 100%)`;
    }
    return dominantHex;
  }

  /**
   * Calcula el color dominante y también devuelve el color de texto recomendado.
   * Retorna un objeto con background y textColor.
   */
  export async function getBackgroundAndTextColor(
    url: string,
    options?: Options
  ): Promise<{ background: string; textColor: string }> {
    const opts = { ...defaults, ...(options || {}) };
  
    const img = await loadImage(url);
    const { dominantHex } = extractDominant(img, opts);
  
    const textColor = getContrastColor(dominantHex);
    let background: string;
  
    if (opts.asGradient) {
      const darker = darkenHex(dominantHex, 0.22);
      background = `linear-gradient(180deg, ${dominantHex} 0%, ${darker} 100%)`;
    } else {
      background = dominantHex;
    }
  
    return { background, textColor };
  }
  
  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // necesario para CORS
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen o CORS bloqueado"));
      img.src = src;
    });
  }
  
  function extractDominant(
    img: HTMLImageElement,
    opts: Required<Options>
  ): { dominantHex: string } {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
  
    const scale = Math.min(1, opts.maxDimension / Math.max(w, h));
    const dw = Math.max(1, Math.round(w * scale));
    const dh = Math.max(1, Math.round(h * scale));
  
    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas no soportado");
  
    ctx.drawImage(img, 0, 0, dw, dh);
  
    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, dw, dh);
    } catch {
      throw new Error(
        "No se puede leer píxeles (CORS). El servidor debe incluir Access-Control-Allow-Origin."
      );
    }
  
    const buf = data.data;
    const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
    const step = Math.max(1, opts.sampleStep);
  
    for (let y = 0; y < dh; y += step) {
      for (let x = 0; x < dw; x += step) {
        const i = (y * dw + x) * 4;
        const a = buf[i + 3];
        if (a < 200) continue; // ignoramos transparente
        const r = buf[i];
        const g = buf[i + 1];
        const b = buf[i + 2];
        const key = quantKey(r, g, b, opts.quantBits);
        const e = buckets.get(key);
        if (e) {
          e.count++; e.r += r; e.g += g; e.b += b;
        } else {
          buckets.set(key, { count: 1, r, g, b });
        }
      }
    }
  
    if (buckets.size === 0) return { dominantHex: "#808080" };
  
    const [best] = [...buckets.entries()].sort((a, b) => b[1].count - a[1].count);
    const v = best[1];
    const dominantHex = rgbToHex(
      clamp(v.r / v.count),
      clamp(v.g / v.count),
      clamp(v.b / v.count)
    );
    return { dominantHex };
  }
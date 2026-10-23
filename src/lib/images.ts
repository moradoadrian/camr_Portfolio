// Build-time image optimization for the rasters in src/assets.
// Components reference images by their path inside src/assets ("projects/surticel-full.png")
// and get back WebP variants plus a srcset, so phones never download the 1-2k px originals.
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

const assets = import.meta.glob<{ default: ImageMetadata }>("../assets/**/*.{png,jpg,jpeg}", { eager: true });

function load(path: string): ImageMetadata {
  const mod = assets[`../assets/${path}`];
  if (!mod) throw new Error(`[images] not found in src/assets: ${path}`);
  return mod.default;
}

export interface ResponsiveImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export async function responsive(path: string, widths: number[]): Promise<ResponsiveImage> {
  const meta = load(path);
  // Never upscale: drop widths larger than the source
  const usable = widths.filter((w) => w < meta.width);
  usable.push(Math.min(Math.max(...widths), meta.width));
  const largest = Math.max(...usable);

  const img = await getImage({ src: meta, widths: [...new Set(usable)], width: largest, format: "webp" });
  return {
    src: img.src,
    srcset: img.srcSet.attribute,
    width: largest,
    height: Math.round((meta.height / meta.width) * largest),
  };
}

// 1200x630 crop from the top of a screenshot for og:image. JPEG because not every
// social network renders WebP link previews.
export async function socialCard(path: string): Promise<string> {
  const img = await getImage({ src: load(path), width: 1200, height: 630, fit: "cover", position: "top", format: "jpg", quality: 82 });
  return img.src;
}

// Original file (hashed and served from /_astro), for downloads that should keep the source format
export function original(path: string): string {
  return load(path).src;
}

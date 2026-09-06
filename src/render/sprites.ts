// Sprite loading + slicing (원본 스킨 로드 verbatim).
// appie.png 64x64 시트 -> 8x 업스케일 -> 파트 슬라이스 (Unity meta rect).
// boxTex: tex.png -> 1024 리사이즈.
import type { PartSprite } from '../core/state';

const BASE = import.meta.env.BASE_URL;

export type SpriteMap = Partial<Record<PartSprite | 'head' | 'body' | 'fat' | 'boxTex', HTMLCanvasElement | HTMLImageElement>>;

export const sprites: SpriteMap = {};
let ready = 0;

export function spritesReady(): number {
  return ready;
}

function cutSprite(img: CanvasImageSource, x: number, y: number, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('2d context unavailable');
  g.imageSmoothingEnabled = false;
  g.drawImage(img, x, y, w, h, 0, 0, w, h);
  return c;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export async function initSprites(): Promise<void> {
  const jobs: Promise<void>[] = [];
  jobs.push(
    loadImage(`${BASE}assets/appie.png`).then((appieImg) => {
      // 64x64 -> 512x512 nearest 업스케일 (전 에이전트 skinUP=8, 픽셀 또렷하게)
      const UP = 8;
      const big = document.createElement('canvas');
      big.width = 64 * UP;
      big.height = 64 * UP;
      const g = big.getContext('2d');
      if (!g) throw new Error('2d context unavailable');
      g.imageSmoothingEnabled = false;
      g.drawImage(appieImg, 0, 0, 64 * UP, 64 * UP);
      // 원본 Appie.png 64x64 스프라이트 시트 (Unity meta rect 검증, 좌표 *8)
      sprites.arm = cutSprite(big, 56 * UP, 52 * UP, 4 * UP, 12 * UP);
      sprites.leg = cutSprite(big, 4 * UP, 52 * UP, 4 * UP, 12 * UP);
      sprites.head = cutSprite(big, 8 * UP, 8 * UP, 8 * UP, 8 * UP);
      sprites.body = cutSprite(big, 20 * UP, 36 * UP, 8 * UP, 12 * UP);
      ready++;
    }),
  );
  jobs.push(
    loadImage(`${BASE}assets/fat.png`).then((fatImg) => {
      sprites.fat = fatImg;
      ready++;
    }),
  );
  jobs.push(
    loadImage(`${BASE}assets/tex.png`).then((texImg) => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      c.getContext('2d')?.drawImage(texImg, 0, 0, 1024, 1024);
      sprites.boxTex = c;
      ready++;
    }),
  );
  await Promise.allSettled(jobs);
}

export interface AlphaCache {
  w: number;
  h: number;
  alpha: Uint8Array;
}

// 이미지/캔버스 알파 추출 (픽셀 충돌용 캐시)
export function cacheAlpha(src: CanvasImageSource & { width: number; height: number }): AlphaCache | null {
  try {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext('2d');
    if (!g) return null;
    g.drawImage(src, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const alpha = new Uint8Array(c.width * c.height);
    for (let i = 3, j = 0; i < d.length; i += 4, j++) alpha[j] = d[i];
    return { w: c.width, h: c.height, alpha };
  } catch {
    return null;
  }
}

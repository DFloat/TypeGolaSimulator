// Canvas + world/screen transform (원본 w2s, 세로 10유닛).
let canvasEl: HTMLCanvasElement | null = null;
let ctx2d: CanvasRenderingContext2D | null = null;
let W = 0;
let H = 0;
let scale = 1;

export function initCanvas(el: HTMLCanvasElement): CanvasRenderingContext2D {
  canvasEl = el;
  const ctx = el.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx2d = ctx;
  resize();
  return ctx;
}

export function resize(): void {
  if (!canvasEl) return;
  W = canvasEl.width = window.innerWidth;
  H = canvasEl.height = window.innerHeight;
  scale = H / 10; // 세로 10유닛 (전 에이전트/원본 근사)
}

export function w2s(x: number, y: number): [number, number] {
  return [x * scale + W / 2, H / 2 - y * scale];
}

export function canvasWH(): { W: number; H: number; scale: number } {
  return { W, H, scale };
}

export function ctx(): CanvasRenderingContext2D {
  if (!ctx2d) throw new Error('canvas not initialized');
  return ctx2d;
}

export function canvasElRef(): HTMLCanvasElement {
  if (!canvasEl) throw new Error('canvas not initialized');
  return canvasEl;
}

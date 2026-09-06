// Shared mutable game state (mirrors original-like.html globals).
import { LIMITS } from './constants';

export interface Vec {
  x: number;
  y: number;
}

export interface Body extends Vec {
  vx: number;
  vy: number;
  rot: number;
}

export type PartSprite = 'arm' | 'leg';

export interface Part extends Vec {
  ox: number;
  oy: number;
  rot: number;
  spr: PartSprite;
  px: number;
  py: number;
  w: number;
}

export const pointer: Vec = { x: 0, y: 0 };
export const body: Body = { x: 0, y: 0, vx: 0, vy: 0, rot: 0 };

// 원본 팔다리 오프셋/회전 (verbatim)
export const parts: Part[] = [
  { ox: -1.7, oy: 0.28, x: -1.7, y: 0.28, rot: -45, spr: 'arm', px: 0.5, py: 1 / 6, w: 0.48 },
  { ox: 1.7, oy: 0.28, x: 1.7, y: 0.28, rot: 45, spr: 'arm', px: 0.5, py: 1 / 6, w: 0.48 },
  { ox: -0.725, oy: -2.2, x: -0.725, y: -2.2, rot: -19.55, spr: 'leg', px: 0.5, py: 1 / 6, w: 0.48 },
  { ox: 0.725, oy: -2.2, x: 0.725, y: -2.2, rot: 19.55, spr: 'leg', px: 0.5, py: 1 / 6, w: 0.48 },
];

export const bodyLocal = { x: 0, y: -0.2, w: 0.96, px: 0.5, py: 0.5 };
export const headLocal = { x: 0, y: 1, w: 0.96, px: 0.5, py: 0.5 };

export const thatBox = { active: false, x: 0, y: 0, vx: 0, vy: 0, yaw: 0 };
export const fat = {
  active: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  rot: 0,
  size: LIMITS.fatSize,
};
export const seizure: Vec = { x: 0, y: 0 };

export const timers = { nextSeizure: 0, nextNice: 0 };

export interface Trail {
  x: number;
  y: number;
  rot: number;
  t: number;
}
export let trails: Trail[] = [];
export function resetTrails(): void {
  trails = [];
}
export function pushTrail(x: number, y: number, rot: number): void {
  trails.push({ x, y, rot, t: 0 });
}
export function ageTrails(dt: number): void {
  for (const t of trails) t.t += dt;
  trails = trails.filter((t) => t.t < LIMITS.trailLife);
}

export const bgColor = { r: 1, g: 1, b: 1 };
export const vol = { master: 1, game: 1, ui: 1 };

// 원본 DataManager.IsMobileDevice (UA 판정)
export const isMobile =
  /android|iphone|ipad|mobile|tablet/i.test(navigator.userAgent + ' ' + navigator.platform);

// Cross-module UI flag (panel open). Owned by ui/panel, read by modes/loop.
export const uiState = { panelOpen: false };

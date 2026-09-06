// Mode registry (원본 MODES 배열 순서 그대로 — 14개).
// 새 모드 = 배열 한 줄 + modes/ 파일 하나 (hideBody/parts/trails/reset 플래그).
import { body, fat, isMobile, resetTrails, thatBox } from '../core/state';
import { toast } from '../ui/toast';
import type { Mode } from './types';
import { basic } from './basic';
import { inertia } from './inertia';
import { smooth } from './smooth';
import { rotate } from './rotate';
import { invert } from './invert';
import { appieSlide } from './appieSlide';
import { seizureMode } from './seizure';
import { freeze } from './freeze';
import { follow } from './follow';
import { niceComputer } from './niceComputer';
import { fatMan } from './fatman';
import { trail } from './trail';

export const MODES: Mode[] = [
  basic, inertia, smooth, rotate, invert, appieSlide,
  seizureMode, freeze, follow, niceComputer, fatMan, trail,
];
// 원본 싱크 기준(original-like.html) 12모드. 제외(포크 전용):
// 회전2, 싼데비슷한, 당구, 플랩골라, 널스케이프.

let mode = 0;

export function currentMode(): Mode {
  return MODES[mode];
}

export function currentModeIndex(): number {
  return mode;
}

export function setMode(i: number): void {
  mode = i;
  body.vx = body.vy = 0;
  body.rot = 0;
  resetTrails();
  thatBox.active = false;
  fat.active = false; // 기본 비활성 — 모드별 reset()이 활성화/초기화 담당
  const m = MODES[i];
  if (m.reset) m.reset();
  (document.getElementById('modeBox') as HTMLElement).textContent = m.name;
  (document.getElementById('modeDesc') as HTMLElement).textContent = m.desc;
  // 원본 FatAppie.OnEnable (모바일 문구 분기)
  if (fat.active) toast(isMobile ? '뚱뚱남 : 터치해서 날려보내기' : '뚱뚱남 : 클릭해서 날려보내기', '#ffff00');
}

export function nextMode(): void {
  setMode((mode + 1) % MODES.length);
}

export function prevMode(): void {
  setMode((mode - 1 + MODES.length) % MODES.length);
}

// Main loop (원본 loop verbatim — dt 클램프 1/30, 모바일 홀드 메뉴).
import { LIMITS } from './constants';
import { isMobile } from './state';
import { update } from './game';
import { draw } from '../render/draw';
import { currentMode } from '../modes/registry';
import { touchState } from './input';
import { togglePanel } from '../ui/panel';

let last = 0;

export function startLoop(): void {
  last = performance.now();
  requestAnimationFrame(loop);
}

function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  const t = now / 1000;
  // 두 손가락 홀드 0.6887s → 메뉴 토글 (원본 MenuPanelToggle.CanToggleMenuPanelOnMoblie)
  if (isMobile) {
    if (touchState.count === 2) {
      if (touchState.holdTimer >= 0) {
        touchState.holdTimer += dt;
        if (touchState.holdTimer >= LIMITS.holdTime) {
          touchState.holdTimer = -1; // 홀드 유지 중 재트리거 방지 (원본 float.MinValue)
          togglePanel();
        }
      }
    } else {
      touchState.holdTimer = 0;
    }
  }
  update(dt, t);
  draw(() => currentMode().hideBody ?? false);
  requestAnimationFrame(loop);
}

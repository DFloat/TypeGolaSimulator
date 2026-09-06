import { LIMITS } from '../core/constants';
import { fat, uiState } from '../core/state';
import { canvasWH } from '../render/canvas';
import { fatCollision } from '../audio/sounds';
import { toast } from '../ui/toast';
import type { Mode } from './types';

// 원본 Fat.physicsMaterial2D bounciness 0.85 + resting
export function bounceWall(axis: 'x' | 'y', min: number, max: number): void {
  const v = axis === 'x' ? 'vx' : 'vy';
  if (fat[axis] > max) {
    fat[axis] = max;
    if (Math.abs(fat[v]) > LIMITS.stopSpeed) {
      fat[v] = -Math.abs(fat[v]) * LIMITS.fatBounce;
      fatCollision();
    } else fat[v] = 0;
  } else if (fat[axis] < min) {
    fat[axis] = min;
    if (Math.abs(fat[v]) > LIMITS.stopSpeed) {
      fat[v] = Math.abs(fat[v]) * LIMITS.fatBounce;
      fatCollision();
    } else fat[v] = 0;
  }
}

export const fatMan: Mode = {
  name: '뚱뚱남',
  desc: '포인터가 상호작용한 위치로 빠르게 날아갑니다.',
  hideBody: true,
  reset: () => {
    fat.active = true;
    fat.x = fat.y = 0;
    fat.vx = fat.vy = 0;
    fat.rot = 0;
  },
  update: (dt) => {
    if (uiState.panelOpen) return; // 원본: rb.simulated = !MenuPanelToggle.isPanelOpen
    fat.vy -= LIMITS.gravity * dt; // 중력 (Unity 기본)
    fat.x += fat.vx * dt;
    fat.y += fat.vy * dt;
    fat.rot += fat.vx * dt * 2;
    const { W, H, scale } = canvasWH();
    const WX = W / 2 / scale - 1;
    const WY = H / 2 / scale - 1; // 벽 4면 = 화면 경계
    bounceWall('x', -WX, WX);
    bounceWall('y', -WY, WY); // 원본 물리: 속도 낮으면 resting (소리/반사 없이 안착)
    if (Math.hypot(fat.x, fat.y) >= LIMITS.pointerR) {
      // 원본: 경계(반경 20) 넘으면 중앙 리셋 + 토스트
      fat.x = fat.y = 0;
      fat.vx = fat.vy = 0;
      fat.rot = 0;
      toast('너무 빨라서 경계를 넘어섰습니다!');
    }
  },
};

export function launchFat(mx: number, my: number): void {
  const dx = mx - fat.x;
  const dy = my - fat.y;
  const len = Math.hypot(dx, dy) || 1;
  fat.vx = (dx / len) * LIMITS.fatLaunch;
  fat.vy = (dy / len) * LIMITS.fatLaunch;
}

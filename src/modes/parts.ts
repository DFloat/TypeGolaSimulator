// 팔다리 (원본 GolaGolaParts.LookAtBody).
import { RAD, UNITY } from '../core/constants';
import { body, parts, pointer } from '../core/state';
import type { PartsMode } from './types';

export function updateParts(dt: number, partsMode: PartsMode | undefined): void {
  const m = pointer;
  const b = body;
  parts.forEach((p) => {
    if (partsMode === 'mouse') {
      // 반전/동상: 팔다리 = 마우스 + 오프셋
      p.x = m.x + p.ox;
      p.y = m.y + p.oy;
    } else if (partsMode === 'lerp') {
      // 추적: Unity Vector3.Lerp(current, target, dt * MagneticSpeed)
      const t = Math.min(UNITY.partsFollowRate * dt, 1);
      p.x += (m.x + p.ox - p.x) * t;
      p.y += (m.y + p.oy - p.y) * t;
    }
    p.rot = Math.atan2(b.y - p.y, b.x - p.x) / RAD - 90; // 전 에이전트 lookAtBody
  });
}

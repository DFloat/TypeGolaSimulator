// Per-frame update orchestration (원본 update() verbatim).
import { ageTrails, body, pointer, pushTrail, uiState } from './state';
import { updateParts } from '../modes/parts';
import { MODES, currentModeIndex } from '../modes/registry';
import { golaSound } from '../audio/sounds';

let accAngle = 0;
let prevAngle: number | null = null;
let lastRotTime = 0;

export function update(dt: number, now: number): void {
  const m = pointer;
  const b = body;
  if (!uiState.panelOpen) {
    // 마우스 회전 소리 감지 (원점 기준 360도)
    if (prevAngle !== null) {
      const cur = (Math.atan2(m.y, m.x) * 180) / Math.PI;
      let d = cur - prevAngle;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      accAngle += d;
      if (Math.abs(accAngle) >= 360) {
        // 원본 MouseRotationSound: InverseLerp(2.0, 0.5, t) — 빠를수록 1
        const t = now - lastRotTime;
        const speed = Math.min(1, Math.max(0, (2 - t) / 1.5));
        golaSound(speed);
        accAngle = 0;
        lastRotTime = now;
      }
      prevAngle = cur;
    } else {
      prevAngle = (Math.atan2(m.y, m.x) * 180) / Math.PI;
      lastRotTime = now;
    }
  } else {
    prevAngle = null;
  }

  const mode = MODES[currentModeIndex()];
  mode.update(dt, now);
  updateParts(dt, mode.parts);
  if (mode.trails) pushTrail(b.x, b.y, b.rot); // AfterImage: 몸통+머리 잔상
  ageTrails(dt);
}

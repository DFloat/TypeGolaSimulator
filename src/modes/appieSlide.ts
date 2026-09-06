import { LIMITS, RAD } from '../core/constants';
import { pointer, thatBox } from '../core/state';
import type { Mode } from './types';

export const appieSlide: Mode = {
  name: '애피 슬라이드',
  desc: '그가 속도를 모으고 있습니다!',
  hideBody: true,
  reset: () => {
    thatBox.active = true;
    thatBox.x = thatBox.y = 0;
    thatBox.vx = thatBox.vy = 0;
  },
  update: (dt) => {
    const f = {
      x: (pointer.x - thatBox.x) * LIMITS.thatBoxSpring,
      y: (pointer.y - thatBox.y) * LIMITS.thatBoxSpring,
    };
    const fl = Math.hypot(f.x, f.y);
    if (fl <= LIMITS.stopSpeed && fl > 0) {
      f.x = (f.x / fl) * LIMITS.stopSpeed;
      f.y = (f.y / fl) * LIMITS.stopSpeed;
    }
    thatBox.vx += f.x * dt;
    thatBox.vy += f.y * dt;
    thatBox.x += thatBox.vx * dt;
    thatBox.y += thatBox.vy * dt;
    thatBox.yaw += LIMITS.thatBoxYaw * dt * RAD;
    const mag = Math.hypot(thatBox.x, thatBox.y);
    if (mag > LIMITS.pointerR) {
      const k = LIMITS.pointerR / mag;
      thatBox.x *= k;
      thatBox.y *= k;
      thatBox.vx = thatBox.vy = 0;
    }
  },
};

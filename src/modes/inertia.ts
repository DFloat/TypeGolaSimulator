import { LIMITS } from '../core/constants';
import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const inertia: Mode = {
  name: '관성',
  desc: '포인터 위치로 몸통이 빨려들어가듯 움직입니다.',
  update: (dt) => {
    const s = LIMITS.springS;
    const d = LIMITS.springD;
    body.vx += ((pointer.x - body.x) * s - body.vx * d) * dt;
    body.vy += ((pointer.y - body.y) * s - body.vy * d) * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  },
};

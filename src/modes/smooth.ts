import { UNITY } from '../core/constants';
import { body, pointer } from '../core/state';
import type { Mode } from './types';

// Unity GolaGolaBody.SmoothTo 그대로: t = 1 - exp(-moveSpeed * dt).
export const smooth: Mode = {
  name: '부드럽게',
  desc: '포인터 위치로 몸통이 부드럽게 이동합니다.',
  update: (dt) => {
    const t = 1 - Math.exp(-UNITY.bodyFollowRate * dt);
    body.x += (pointer.x - body.x) * t;
    body.y += (pointer.y - body.y) * t;
  },
};

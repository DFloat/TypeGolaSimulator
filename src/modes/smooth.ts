import { LIMITS } from '../core/constants';
import { body, pointer } from '../core/state';
import type { Mode } from './types';

// NOTE(싱크): 원본 Unity SmoothTo는 지수감쇠(1-exp(-10·dt))이나,
// 웹 싱크 기준(original-like.html)은 아래 선형 lerp다. 값을 바꾸지 않는다.
export const smooth: Mode = {
  name: '부드럽게',
  desc: '포인터 위치로 몸통이 부드럽게 이동합니다.',
  update: (dt) => {
    const t = Math.min(LIMITS.lerp * dt, 1);
    body.x += (pointer.x - body.x) * t;
    body.y += (pointer.y - body.y) * t;
  },
};

import { LIMITS } from '../core/constants';
import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const rotate: Mode = {
  name: '회전',
  desc: '몸통이 회전합니다.',
  update: (dt) => {
    body.rot -= LIMITS.rotFast * dt;
    body.x = pointer.x;
    body.y = pointer.y;
  },
};

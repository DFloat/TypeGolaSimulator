import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const freeze: Mode = {
  name: '동상',
  desc: '모든 부분이 고정된 채로 포인터를 따라옵니다.',
  parts: 'mouse',
  update: () => {
    body.x = pointer.x;
    body.y = pointer.y;
  },
};

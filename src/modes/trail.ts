import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const trail: Mode = {
  name: '잔상',
  desc: '몸통에 잔상이 생깁니다.',
  trails: true,
  update: () => {
    body.x = pointer.x;
    body.y = pointer.y;
  },
};

import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const basic: Mode = {
  name: '기본',
  desc: '포인터 위치로 몸통이 이동합니다.',
  update: () => {
    body.x = pointer.x;
    body.y = pointer.y;
  },
};

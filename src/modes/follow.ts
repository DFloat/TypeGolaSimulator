import { body, pointer } from '../core/state';
import type { Mode } from './types';

export const follow: Mode = {
  name: '추적',
  desc: '팔, 다리가 몸통을 기준으로 부드럽게 이동합니다.',
  parts: 'lerp',
  update: () => {
    body.x = pointer.x;
    body.y = pointer.y;
  },
};

import { body, pointer, timers } from '../core/state';
import type { Mode } from './types';

export const niceComputer: Mode = {
  name: '나이스한 컴퓨터',
  desc: '메모리가 부족할 정도로 고급 움직임을 시도합니다.',
  update: (_dt, now) => {
    if (now >= timers.nextNice) {
      timers.nextNice = now + Math.random() / 2;
      body.x = pointer.x;
      body.y = pointer.y;
    }
  },
};

import { LIMITS } from '../core/constants';
import { body, pointer, seizure, timers } from '../core/state';
import type { Mode } from './types';

export const seizureMode: Mode = {
  name: '발작',
  desc: '포인터 주변 랜덤한 공간으로 주기적으로 이동합니다.',
  update: (_dt, now) => {
    if (now >= timers.nextSeizure) {
      timers.nextSeizure = now + LIMITS.seizureInterval;
      const r = Math.random() * LIMITS.seizureR;
      const a = Math.random() * Math.PI * 2;
      seizure.x = Math.cos(a) * r;
      seizure.y = Math.sin(a) * r;
    }
    body.x = pointer.x + seizure.x;
    body.y = pointer.y + seizure.y;
  },
};

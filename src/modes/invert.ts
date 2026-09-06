import type { Mode } from './types';

export const invert: Mode = {
  name: '반전',
  desc: '몸통 대신 팔, 다리를 조작합니다.',
  parts: 'mouse',
  update: () => {},
};

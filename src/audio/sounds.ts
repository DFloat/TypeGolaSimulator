// Sound bank (원본 SND + CREDIT_BGM — fetch+decode, base64 디코딩과 동등).
// Files under public/assets (extracted losslessly by tools/extract-assets.py).
import { LIMITS } from '../core/constants';
import { fat, vol, isMobile } from '../core/state';
import { save } from '../core/storage';
import { audio, audioState } from './context';
import { canvasWH } from '../render/canvas';

const BASE = import.meta.env.BASE_URL;

const FILES = {
  tick: ['tick.wav'],
  tock: ['tock.wav'],
  sw: ['sw.wav'],
  bell: ['bell.mp3'],
  blow: ['blow.wav'],
  voice: ['voice-0.mp3', 'voice-1.mp3', 'voice-2.mp3', 'voice-3.mp3'],
} as const;

export type SoundName = keyof typeof FILES;

const buffers: Partial<Record<SoundName | 'creditBgm', AudioBuffer[]>> = {};

async function decode(url: string): Promise<AudioBuffer> {
  const a = audio();
  const res = await fetch(url);
  const data = await res.arrayBuffer();
  return a.decodeAudioData(data);
}

export async function loadSounds(): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const [name, files] of Object.entries(FILES) as [SoundName, readonly string[]][]) {
    jobs.push(
      (async () => {
        const out: AudioBuffer[] = [];
        for (const f of files) {
          try {
            out.push(await decode(`${BASE}assets/${f}`));
          } catch {
            /* missing clip -> skip (playSound guards empty) */
          }
        }
        buffers[name] = out;
      })(),
    );
  }
  jobs.push(
    (async () => {
      try {
        buffers.creditBgm = [await decode(`${BASE}assets/credit-bgm.webm`)];
      } catch {
        buffers.creditBgm = [];
      }
    })(),
  );
  await Promise.all(jobs);
}

export interface PlayOptions {
  channel?: 'ui' | 'game';
  allow?: boolean;
  pitch?: number;
  pan?: number;
  vol?: number;
}

// P1-6: 옵션 객체 (channel/allow/pitch/pan/vol)
export function playSound(name: SoundName, opts: PlayOptions = {}): void {
  const { channel = 'ui', allow, pitch = 1, pan = 0, vol: asVol = 0.8 } = opts;
  const list = buffers[name];
  if (!list || !list.length) return;
  if (allow !== false && channel === 'game' && !save.GolaSoundAllow) return;
  const a = audio();
  const buf = list[Math.floor(Math.random() * list.length)];
  const src = a.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = Math.min(LIMITS.pitchMax, Math.max(LIMITS.pitchMin, pitch)); // 원본 AudioInstance.SetPitch clamp 0.1~3
  const g = a.createGain();
  const chVol = channel === 'game' ? vol.game : channel === 'ui' ? vol.ui : 1;
  g.gain.value = Math.max(0.001, asVol * chVol * vol.master); // 원본: asVolume(뚱뚱남 0.5) 적용
  if (pan !== 0 && a.createStereoPanner) {
    // 원본 Play3DSound: 위치 기반 패닝
    const p = a.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    src.connect(g);
    g.connect(p);
    p.connect(a.destination);
  } else {
    src.connect(g);
    g.connect(a.destination);
  }
  if (a.state === 'suspended') {
    void a.resume().then(() => {
      try {
        src.start();
      } catch {
        /* already started */
      }
    });
  } else src.start();
}

export function uiClick(): void {
  playSound('tick', { channel: 'ui' }); // 원본: 버튼 = Tick.wav
}
export function uiTock(): void {
  playSound('tock', { channel: 'ui' }); // 원본: 슬라이더 = Tock.wav
}
export function uiSwitch(): void {
  playSound('sw', { channel: 'ui' }); // 원본: 토글 = light-switch-tap.wav
}

export function golaSound(speed: number): void {
  // 원본 MouseRotationSound.OnFullRotationDetected: PitchAllow면 max(0.4, speed)*1.4, 아니면 1
  const pitch = save.GolaSoundPitchAllow ? Math.max(0.4, speed) * LIMITS.pitchMul : 1;
  playSound('voice', { channel: 'game', pitch });
}

export function fatCollision(): void {
  // 원본 FatAppie: 3D 사운드 (위치 기반 패닝) + 볼륨 0.5
  const { W, scale } = canvasWH();
  const halfW = W / 2 / scale;
  const pan = halfW ? Math.max(-1, Math.min(1, fat.x / halfW)) : 0;
  playSound('bell', { channel: 'game', allow: false, pan, vol: 0.5 });
}

/* 크레딧 BGM (원본 New End Beginning, 5MLoop) */
let creditBgmSrc: AudioBufferSourceNode | null = null;

export function startCreditBgm(): void {
  const a = audio();
  const list = buffers.creditBgm;
  if (creditBgmSrc || !list || !list.length) return;
  const src = a.createBufferSource();
  src.buffer = list[0];
  src.loop = true;
  const g = a.createGain();
  g.gain.value = Math.max(0.001, 0.6 * vol.master);
  src.connect(g);
  g.connect(a.destination);
  if (a.state === 'suspended') {
    void a.resume().then(() => {
      try {
        src.start();
      } catch {
        /* already started */
      }
    });
  } else src.start();
  creditBgmSrc = src;
}

export function stopCreditBgm(): void {
  if (!creditBgmSrc) return;
  try {
    creditBgmSrc.stop();
  } catch {
    /* already stopped */
  }
  creditBgmSrc = null;
}

export function isDesktopAutoplay(): boolean {
  return !isMobile;
}

export function resumeIfSuspended(): void {
  const a = audioState();
  if (a && a.state === 'suspended') void a.resume();
}

// AudioContext singleton (원본 audio()/ensureAudio).
let ac: AudioContext | null = null;

export function audio(): AudioContext {
  if (!ac) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ac = new AC();
  }
  return ac;
}

export function audioState(): AudioContext | null {
  return ac;
}

let soundsRequested = false;

export function ensureAudio(onFirstGesture: () => void): void {
  const a = audio();
  if (a.state === 'suspended') void a.resume();
  // 모바일: 첫 제스처에서 loadSounds 1회 (AudioContext autoplay 경고 방지)
  if (!soundsRequested) {
    soundsRequested = true;
    onFirstGesture();
  }
}

export function markSoundsRequested(): void {
  soundsRequested = true;
}

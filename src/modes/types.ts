// Mode contract (원본 MODES entries: name/desc/update + flags).
export type PartsMode = 'mouse' | 'lerp';

export interface Mode {
  name: string;
  desc: string;
  /** hide character (appieSlide/fatMan) */
  hideBody?: boolean;
  /** parts follow rule (invert/freeze = mouse, follow = lerp) */
  parts?: PartsMode;
  /** push afterimage trail each frame */
  trails?: boolean;
  reset?: () => void;
  update: (dt: number, now: number) => void;
}

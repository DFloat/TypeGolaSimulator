// Save (verbatim format: GolaSaveData v2, 원본 SaveData.VersionName 로직).
export const SAVE_KEY = 'GolaSaveData';
export const SAVE_VER = 2;

export interface SaveData {
  v: number;
  MasterVolume: number;
  GameVolume: number;
  UIVolume: number;
  ToastMessageAllow: boolean;
  GolaSoundAllow: boolean;
  GolaSoundPitchAllow: boolean;
}

const defSave = (): SaveData => ({
  v: SAVE_VER,
  MasterVolume: 100,
  GameVolume: 100,
  UIVolume: 100,
  ToastMessageAllow: true,
  GolaSoundAllow: true,
  GolaSoundPitchAllow: false,
});

function load(): SaveData {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') as Partial<SaveData> | null;
    if (s && (s as { v?: unknown }).v === SAVE_VER) {
      const merged = Object.assign(defSave(), s);
      // 이전 오타 키(ToastMessegeAllow) 마이그레이션 (원본 SaveData.ToastMessageAllow)
      if (typeof (s as Record<string, unknown>).ToastMessegeAllow === 'boolean') {
        merged.ToastMessageAllow = (s as Record<string, unknown>).ToastMessegeAllow as boolean;
      }
      return merged;
    }
  } catch {
    /* corrupted save -> defaults */
  }
  return defSave();
}

export const save: SaveData = load();

export function persist(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* storage unavailable -> ignore */
  }
}

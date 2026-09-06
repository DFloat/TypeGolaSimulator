// Sync source: original-like.html LIMITS (verbatim values).
// Unity cross-check: gravity 9.81 (default), pointerR 20 (PointerPos),
// fatBounce 0.85 (Fat.physicsMaterial2D).
export const LIMITS = {
  pointerR: 20,
  fatLaunch: 200,
  holdTime: 0.6887,
  fatBounce: 0.85,
  gravity: 9.81,
  stopSpeed: 4,
  springS: 200,
  springD: 5,
  lerp: 5,
  rotFast: 360 * 1.5,
  thatBoxSpring: 1.2,
  thatBoxYaw: 360 * 1.0,
  seizureInterval: 0.1,
  seizureR: 2,
  trailLife: 0.5,
  trailAlpha: 0.45,
  trailScale: 0.4,
  soundStep: 0.05,
  pitchMin: 0.1,
  pitchMax: 3,
  pitchMul: 1.4,
  fatSize: 2.56,
  mobileFatScale: 0.6,
  toastH1: 55,
  toastH2: 35,
  toastMax: 3,
  toastChars: 4,
  toastDur: 3500,
  toastKill: 300,
  toastKillFast: 50,
} as const;

export const RAD = Math.PI / 180;

// Unity 실측값 (scene/project 설정에서 직접 확인).
// LIMITS는 웹 싱크 기준(original-like.html) 기록용으로 보존하고,
// 아래 값으로 실제 동작을 교정한다.
export const UNITY = {
  bodyFollowRate: 20, // GolaGolaBody.moveSpeed (Main.unity scene 값)
  partsFollowRate: 1.5, // GolaGolaParts.MagneticSpeed (Main.unity scene 값)
  rainbowCycleSec: 1, // BackgroundPreview: hue += deltaTime (1초/바퀴)
  toastShowMs: 3000, // ToastUIData.ShowTime
  toastMoveMs: 200, // ToastUIData.MoveDuration
} as const;

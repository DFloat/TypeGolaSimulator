// Setting panel (원본 SettingPanelToggle/BackgroundSetting/Slider/ToggleSwitch verbatim).
import { LIMITS } from '../core/constants';
import { bgColor, isMobile, uiState, vol } from '../core/state';
import { persist, save } from '../core/storage';
import { uiClick, uiSwitch, uiTock } from '../audio/sounds';
import { toast } from './toast';
import { nextMode, prevMode } from '../modes/registry';
import { openModal } from './modal';
import { showCredit } from './credit';

export function uiEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
}

// 배경색 단일 진입점 (canvas/CSS/미리보기/슬라이더/HEX/RGB 입력 전부 여기서)
export function setBg(r: number, g: number, b: number): void {
  bgColor.r = r;
  bgColor.g = g;
  bgColor.b = b;
  document.body.style.setProperty(
    '--bg-color',
    `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`,
  );
  const rgb = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  uiEl('colorPreview').style.background = rgb;
  // HEX + RGB 슬라이더 동기화 (원본 BackgroundSetting: 무지개도 슬라이더/입력 연동)
  const hex = `#${[r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
  const hi = uiEl('hexInput') as HTMLInputElement;
  if (document.activeElement !== hi) hi.value = hex.toUpperCase();
  [r, g, b].forEach((v, i) => {
    const track = document.querySelector(`.slider-track[data-ch="${i}"]`);
    if (track) {
      (track.querySelector('.fill') as HTMLElement).style.width = `${v * 100}%`;
      (track.querySelector('.handle') as HTMLElement).style.left = `${v * 100}%`;
    }
    (uiEl(['valR', 'valG', 'valB'][i]) as HTMLInputElement).value = v.toFixed(1);
    lastRGB[i] = v; // 원본 InputFieldValueLimiter.lastText
  });
}

export const lastRGB = [1, 1, 1];
let lastHex = '#FFFFFF'; // 원본 InputFieldHexLimiter.lastText

export function applyHex(silent?: boolean): void {
  // HEX 입력 시 무지개 중단 (원본 BackgroundSetting 동작)
  if (rainbowId) {
    clearInterval(rainbowId);
    rainbowId = null;
    uselessCount = 0;
  }
  const ul = uiEl('uselessLabel');
  if (ul.textContent === 'GolaGola?') {
    ul.textContent = '인생에 전혀 필요 없는 스위치';
    ul.style.color = '#fff';
  }
  const hi = uiEl('hexInput') as HTMLInputElement;
  const v = hi.value.trim().replace(/^#/, '');
  // 원본 InputFieldHexLimiter.CheckValue: 무효면 이전 값 복원, 유효면 #+대문자로 확정
  if (!/^[0-9a-fA-F]{6}$/.test(v)) {
    hi.value = lastHex;
    return;
  }
  const up = v.toUpperCase();
  lastHex = `#${up}`;
  hi.value = lastHex;
  const n = parseInt(up, 16);
  setBg(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  if (!silent) uiClick(); // 메뉴 닫기 커밋(silent)일 땐 소리 없음
}

// 원본 BackgroundSetting: RGB float 입력(0~1) — InputFieldValueLimiter
export function applyRgbInput(i: number): void {
  const el = uiEl(['valR', 'valG', 'valB'][i]) as HTMLInputElement;
  let v = parseFloat(el.value);
  if (isNaN(v)) {
    el.value = lastRGB[i].toFixed(1);
    return;
  }
  v = Math.max(0, Math.min(1, v)); // 원본 Mathf.Clamp
  el.value = v.toFixed(1);
  lastRGB[i] = v;
  const arr = [bgColor.r, bgColor.g, bgColor.b];
  arr[i] = v;
  setBg(arr[0], arr[1], arr[2]);
}

export type VolKey = 'master' | 'game' | 'ui';

const saveKeyFor = (k: VolKey): 'MasterVolume' | 'GameVolume' | 'UIVolume' =>
  (k === 'ui' ? 'UI' : k[0].toUpperCase() + k.slice(1)) + 'Volume' as
    | 'MasterVolume'
    | 'GameVolume'
    | 'UIVolume';
const volLabelId = (k: VolKey): string => `v${k === 'ui' ? 'Ui' : k[0].toUpperCase() + k.slice(1)}`;

export function setVol(k: VolKey, pct: number): void {
  vol[k] = pct;
  save[saveKeyFor(k)] = Math.round(pct * 100);
  persist();
  uiEl(volLabelId(k)).textContent = `${Math.round(pct * 100)}%`;
}

interface PosEvent {
  clientX: number;
}

export function moveSlider(e: PosEvent, track: Element, ch: number): void {
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  (track.querySelector('.fill') as HTMLElement).style.width = `${pct * 100}%`;
  (track.querySelector('.handle') as HTMLElement).style.left = `${pct * 100}%`;
  (uiEl(['valR', 'valG', 'valB'][ch]) as HTMLInputElement).value = pct.toFixed(1);
  const arr = [bgColor.r, bgColor.g, bgColor.b];
  arr[ch] = pct;
  setBg(arr[0], arr[1], arr[2]);
  playSliderStep(track, pct);
}

export function moveVol(e: PosEvent, track: Element, key: VolKey): void {
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  (track.querySelector('.fill') as HTMLElement).style.width = `${pct * 100}%`;
  (track.querySelector('.handle') as HTMLElement).style.left = `${pct * 100}%`;
  setVol(key, pct);
  playSliderStep(track, pct);
}

// 원본 Slider.cs: soundStep 0.05 단위로 값이 바뀔 때만 소리
export function playSliderStep(track: Element, pct: number): void {
  const step = Math.round(pct / LIMITS.soundStep);
  const el = track as HTMLElement;
  if (el.dataset.step !== String(step)) {
    el.dataset.step = String(step);
    uiTock();
  }
}

export function handleSliderInput(e: PosEvent, track: Element): void {
  if (track.classList.contains('vol')) moveVol(e, track, (track as HTMLElement).dataset.key as VolKey);
  else handleRgbSlider(e, track);
}

function handleRgbSlider(e: PosEvent, track: Element): void {
  moveSlider(e, track, Number((track as HTMLElement).dataset.ch));
}

export type SaveToggleKey = 'ToastMessageAllow' | 'GolaSoundAllow' | 'GolaSoundPitchAllow';

export function setToggle(
  key: SaveToggleKey,
  swId: string,
  labelId: string,
  onText: string,
  offText: string,
  toastOn?: string,
  toastOff?: string,
): void {
  uiSwitch();
  save[key] = !save[key];
  persist();
  syncToggle(key, swId, labelId, onText, offText);
  uiClick();
  if (toastOn) toast(save[key] ? toastOn : toastOff ?? '', '#ffff00');
}

export function syncToggle(
  key: SaveToggleKey,
  swId: string,
  labelId: string,
  onText: string,
  offText: string,
): void {
  uiEl(swId).classList.toggle('off', !save[key]);
  const lb = uiEl(labelId);
  lb.textContent = save[key] ? onText : offText;
  lb.className = `toggle-label ${save[key] ? 'green' : ''}`;
}

export function toggleToast(): void {
  setToggle(
    'ToastMessageAllow', 'toastSwitch', 'toastLabel',
    '토스트 메시지 켜짐', '토스트 메시지 꺼짐', '토스트 메시지: 켜짐', '토스트 메시지: 꺼짐',
  );
}
export function toggleGola(): void {
  setToggle(
    'GolaSoundAllow', 'golaSwitch', 'golaLabel',
    'GolaGola할 때 소리 허용', 'GolaGola할 때 소리 없음', 'GolaGola 소리: 허용', 'GolaGola 소리: 차단',
  );
}
export function togglePitch(): void {
  setToggle(
    'GolaSoundPitchAllow', 'pitchSwitch', 'pitchLabel',
    'GolaGola 소리 배속 허용', 'GolaGola 소리 배속 안함', '소리 배속: 허용', '소리 배속: 차단',
  );
}

let uselessCount = 0;
let rainbowId: number | null = null;

function hsl(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r: number;
  let g: number;
  let b: number;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [r + m, g + m, b + m];
}

export function toggleUseless(): void {
  uiSwitch();
  const el = uiEl('uselessSwitch');
  el.classList.toggle('off');
  const label = uiEl('uselessLabel');
  uselessCount++;
  if (uselessCount === 30) {
    label.textContent = 'GolaGola?';
    label.className = 'toggle-label';
    let hue = 0; // 원본: hue += deltaTime (1초/바퀴)
    rainbowId = window.setInterval(() => {
      hue = (hue + 0.05) % 1;
      const [r, g, b] = hsl(hue * 360, 1, 0.5);
      setBg(r, g, b);
      label.style.color = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`; // 원본 RainbowTMP
    }, 50);
    toast('GolaGola?', '#ffff00');
  }
  // NOTE: 원본 UselessSwitch에 40리셋 없음 (무지개 무한). 포크 창작이던 자동복원 제거.
  uiClick();
}

/* Elastic 스크롤 (원본 ScrollRect: Elastic + 관성) */
let scrollVel = 0;
let overshoot = 0;
let elasticRAF: number | null = null;
let dragTrack: Element | null = null;

export function setDragTrack(t: Element | null): void {
  dragTrack = t;
}
export function getDragTrack(): Element | null {
  return dragTrack;
}

function elasticTick(): void {
  const panelEl = uiEl('panel');
  const panelInner = uiEl('panel-inner');
  const max = panelEl.scrollHeight - panelEl.clientHeight;
  if (Math.abs(scrollVel) > 0.5) {
    let target = panelEl.scrollTop + scrollVel;
    // 쿠션 방향 (원본 Elastic)
    let newOv = 0;
    if (target < 0) {
      newOv = -target * 1.5;
      target = 0;
    } else if (target > max) {
      newOv = -(target - max) * 1.5;
      target = max;
    }
    if (Math.abs(newOv) > Math.abs(overshoot)) overshoot = newOv;
    panelEl.scrollTop = target;
    scrollVel *= 0.85;
  }
  // overshoot은 컨텐츠(#panel-inner)만 밀기 — 패널 배경은 유지
  if (Math.abs(overshoot) > 0.5) {
    panelInner.style.transform = `translateY(${overshoot.toFixed(1)}px)`;
    overshoot *= 0.92; // 관대한 복원 (원본 elasticity 0.1)
  } else if (overshoot !== 0) {
    panelInner.style.transform = '';
    overshoot = 0;
  }
  elasticRAF = requestAnimationFrame(elasticTick); // 닫으면 togglePanel에서 취소
}

export function togglePanel(): void {
  uiState.panelOpen = !uiState.panelOpen;
  uiEl('panel').classList.toggle('open', uiState.panelOpen);
  if (uiState.panelOpen) {
    if (!elasticRAF) elasticRAF = requestAnimationFrame(elasticTick);
  } else {
    // 원본 MenuPanelToggle: 닫을 때 입력필드 커밋 + 슬라이더 드래그 해제
    dragTrack = null;
    applyHex(true);
    if (elasticRAF) cancelAnimationFrame(elasticRAF);
    elasticRAF = null;
    uiEl('panel-inner').style.transform = '';
    overshoot = 0;
  }
}

export function isPanelOpen(): boolean {
  return uiState.panelOpen;
}

export function initPanel(): void {
  const panelEl = uiEl('panel');
  panelEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    panelEl.scrollTop += (e as WheelEvent).deltaY;
    scrollVel = (e as WheelEvent).deltaY * 0.5; // 관성 (누적 아님)
  });

  uiEl('modePrevBtn').addEventListener('click', () => {
    prevMode();
    uiClick();
  });
  uiEl('modeNextBtn').addEventListener('click', () => {
    nextMode();
    uiClick();
  });
  uiEl('toastSwitch').addEventListener('click', toggleToast);
  uiEl('uselessSwitch').addEventListener('click', toggleUseless);
  uiEl('golaSwitch').addEventListener('click', toggleGola);
  uiEl('pitchSwitch').addEventListener('click', togglePitch);
  uiEl('modalOpenBtn').addEventListener('click', openModal);
  uiEl('creditOpenBtn').addEventListener('click', () => {
    showCredit();
    uiClick();
  });

  for (const track of document.querySelectorAll('.slider-track')) {
    track.addEventListener('mousedown', (e) => {
      setDragTrack(track);
      handleSliderInput(e as MouseEvent, track);
    });
  }

  const hexInput = uiEl('hexInput') as HTMLInputElement;
  hexInput.addEventListener('change', () => applyHex());
  hexInput.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') applyHex();
  });
  (['valR', 'valG', 'valB'] as const).forEach((id, i) => {
    const el = uiEl(id) as HTMLInputElement;
    el.addEventListener('change', () => applyRgbInput(i));
    el.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') applyRgbInput(i);
    });
  });

  // 초기 복원 (원본 init 블록)
  syncToggle('ToastMessageAllow', 'toastSwitch', 'toastLabel', '토스트 메시지 켜짐', '토스트 메시지 꺼짐');
  syncToggle('GolaSoundAllow', 'golaSwitch', 'golaLabel', 'GolaGola할 때 소리 허용', 'GolaGola할 때 소리 없음');
  syncToggle('GolaSoundPitchAllow', 'pitchSwitch', 'pitchLabel', 'GolaGola 소리 배속 허용', 'GolaGola 소리 배속 안함');
  (['master', 'game', 'ui'] as VolKey[]).forEach((k) => {
    const v = save[k === 'ui' ? 'UIVolume' : k === 'master' ? 'MasterVolume' : 'GameVolume'] / 100;
    setVol(k, v);
    const track = document.querySelector(`.slider-track[data-key="${k}"]`);
    if (track) {
      (track.querySelector('.fill') as HTMLElement).style.width = `${v * 100}%`;
      (track.querySelector('.handle') as HTMLElement).style.left = `${v * 100}%`;
    }
  });

  if (isMobile) document.body.classList.add('mobile'); // 모바일 전용 CSS 훅
}

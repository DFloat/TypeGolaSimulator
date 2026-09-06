// Input layer (원본 입력 리스너 verbatim — mouse/touch/keyboard).
// P1-2: 마우스/터치 리스너 단일화.
import { LIMITS } from './constants';
import { fat, isMobile, pointer, uiState } from './state';
import { canvasWH, canvasElRef } from '../render/canvas';
import { ensureAudio } from '../audio/context';
import { loadSounds, resumeIfSuspended } from '../audio/sounds';
import { getDragTrack, handleSliderInput, setDragTrack, togglePanel } from '../ui/panel';
import { isCreditOpen, setCreditPress } from '../ui/credit';
import { launchFat } from '../modes/fatman';
import { toast } from '../ui/toast';

export function setPointer(cx: number, cy: number): void {
  const { W, H, scale } = canvasWH();
  pointer.x = (cx - W / 2) / scale;
  pointer.y = (H / 2 - cy) / scale;
  // 반경 20 클램프 (원본 PointerPos)
  const mag = Math.hypot(pointer.x, pointer.y);
  if (mag > LIMITS.pointerR) {
    pointer.x *= LIMITS.pointerR / mag;
    pointer.y *= LIMITS.pointerR / mag;
  }
}

// Touch state shared with loop (two-finger hold -> menu).
export const touchState = { count: 0, holdTimer: 0, offset: { x: 0, y: 0 } };

const touchInOverlay = (t: Touch): boolean =>
  !!(t.target instanceof Element && t.target.closest?.('#panel, #modal, #credit, #intro'));

function launchFatAt(clientX: number, clientY: number): void {
  const { W, H, scale } = canvasWH();
  const mx = (clientX - W / 2) / scale;
  const my = (H / 2 - clientY) / scale;
  launchFat(mx, my);
}

export function initInput(): void {
  document.addEventListener('keydown', (e) => {
    ensureAudio(() => void loadSounds());
    if (e.key === 'Tab') {
      e.preventDefault();
      togglePanel();
    } else if (e.key === 'm' || e.key === 'M') {
      const hidden = document.body.style.cursor === 'none';
      document.body.style.cursor = hidden ? 'crosshair' : 'none';
      canvasElRef().style.cursor = hidden ? 'crosshair' : 'none';
      toast(hidden ? '마우스 보임' : '마우스 보이지 않음');
    }
  });

  document.addEventListener('mousedown', (e) => {
    ensureAudio(() => void loadSounds()); // 제스처(클릭) 시 AC 생성/재개
    // 슬라이더 (원본 Slider.cs)
    const track = e.target instanceof Element ? e.target.closest('.slider-track') : null;
    if (track) {
      setDragTrack(track);
      handleSliderInput(e, track);
    }
    // 크레딧 길게 누르기 (원본 CreditPrinter press)
    if (isCreditOpen()) setCreditPress(true);
    // 뚱뚱남 발사 (원본 FatAppie)
    if (uiState.panelOpen || !fat.active) return;
    launchFatAt(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', (e) => {
    resumeIfSuspended();
    const drag = getDragTrack();
    if (drag) handleSliderInput(e, drag); // 슬라이더 드래그
    setPointer(e.clientX, e.clientY); // 포인터 추적
  });

  document.addEventListener('mouseup', () => {
    setDragTrack(null);
    setCreditPress(false);
  });

  document.addEventListener(
    'touchstart',
    (e) => {
      ensureAudio(() => void loadSounds()); // iOS: 사용자 제스처에서 AC 생성/재개
      const t0 = e.touches[0];
      // 슬라이더 (원본 Slider.cs)
      const track = t0.target instanceof Element ? t0.target.closest('.slider-track') : null;
      if (track) {
        e.preventDefault();
        setDragTrack(track);
        handleSliderInput(t0, track);
      }
      // 크레딧 길게 누르기 (원본 CreditPrinter press)
      if (isCreditOpen()) setCreditPress(true);
      // 게임 (원본 PointerPos.MobileControl + MenuPanelToggle + MobileGameobjectSetter)
      touchState.count = e.touches.length;
      if (touchState.count === 1) {
        // 원본 MobileControl: press 시 offset = body - touch
        const c = e.touches[0];
        const { W, H, scale } = canvasWH();
        touchState.offset = {
          x: pointer.x - (c.clientX - W / 2) / scale,
          y: pointer.y - (H / 2 - c.clientY) / scale,
        };
      }
      if (touchInOverlay(t0)) return; // 패널/모달/크레딧/인트로 위는 게임 조작 안 함
      e.preventDefault(); // 더블탭 줌·롱프레스·스크롤 방지
      if (!uiState.panelOpen && fat.active) {
        // 뚱뚱남 발사 (원본 FatAppie.TryGetClickPosition)
        launchFatAt(t0.clientX, t0.clientY);
      }
    },
    { passive: false },
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      touchState.count = e.touches.length;
      const drag = getDragTrack();
      if (drag && e.touches.length) {
        e.preventDefault();
        handleSliderInput(e.touches[0], drag);
      } // 슬라이더 드래그
      if (touchInOverlay(e.touches[0])) return;
      e.preventDefault();
      if (uiState.panelOpen || touchState.count !== 1) return;
      const c = e.touches[0];
      // 원본 MobileControl: target = touch + offset
      const { scale } = canvasWH();
      setPointer(c.clientX + touchState.offset.x * scale, c.clientY - touchState.offset.y * scale);
    },
    { passive: false },
  );

  const endTouch = (e: TouchEvent): void => {
    setDragTrack(null);
    setCreditPress(false);
    touchState.count = e.touches.length;
  };
  document.addEventListener('touchend', endTouch);
  document.addEventListener('touchcancel', () => {
    setDragTrack(null);
    setCreditPress(false);
    touchState.count = 0;
  });

  if (isMobile) void 0; // (mobile tag text set in main)
}

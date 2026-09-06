// Wiring only (thin). Game logic lives in core/modes/render/audio/ui.
import './style.css';
import { initCanvas, resize } from './render/canvas';
import { initSprites } from './render/sprites';
import { initInput } from './core/input';
import { startLoop } from './core/loop';
import { initPanel } from './ui/panel';
import { initModal } from './ui/modal';
import { runIntro } from './ui/intro';
import { loadSounds } from './audio/sounds';
import { markSoundsRequested } from './audio/context';
import { isMobile } from './core/state';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) throw new Error('#game missing');
initCanvas(canvas);
window.addEventListener('resize', resize);

initInput();
initPanel();
initModal();

(document.getElementById('mobileTag') as HTMLElement).textContent = isMobile
  ? '모바일 모드 : 켜짐'
  : '모바일 모드 : 꺼짐'; // 감지 확인용 (버전 정보 우측 하단)

void initSprites(); // draw()가 준비될 때까지 대기 (imgsReady 게이트)
if (!isMobile) {
  markSoundsRequested();
  void loadSounds();
} // 모바일: 첫 제스처(터치/클릭)에서 AC 생성 — autoplay 경고 방지

startLoop();
void runIntro();

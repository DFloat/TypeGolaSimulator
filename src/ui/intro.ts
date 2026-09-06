// Intro sequence (원본 대사 verbatim).
import { playSound } from '../audio/sounds';
import { isMobile } from '../core/state';
import { toast } from './toast';

const INTRO = [
  {
    head: '광과민성 발작 경고',
    body: '이 프로그램에는 빠르게 전환되는 색상 패턴이 포함되어 있습니다.\n간질이나 광과민성 질환 내력이 있는 사용자는 발작 또는 발작 증상을 겪을 수 있습니다.\n진행 도중 어지러움, 시야 변화, 눈이나 얼굴의 경련, 발작 등의 증상이 나타나면 즉시 체험을 중단하고 전문의와 상담하십시오.',
  },
  {
    head: '이것은 허구입니다',
    body: '이 프로그램은 완전히 허구이며 현실의 어떤 인물, 단체, 사건, 장소를 묘사하는 것이 아닙니다.\n비슷한 부분이 있을 수 있으나 완전히 우연입니다.\n이 프로그램의 개발자는 이 프로그램에서 묘사된 행위를 승인하거나 독려하거나 권장하지 않습니다.',
  },
  {
    head: '경고',
    body: '본 프로그램을 실행 및 이용함에 있어 발생할 수 있는 직·간접적인 육체적, 정신적 손해 및 피해에 대하여\n개발자는 어떠한 법적·도의적 책임도 지지 않습니까?\n아 청년치매인가 까먹었다.\n아무튼 조심해서 사용하시고, 동의하지 않으실 경우 즉시 뽀로로 잠옷세트를 입고 숙면하시기 바랍니다.',
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function typeText(el: HTMLElement, text: string, dur: number): Promise<void> {
  return new Promise((resolve) => {
    const n = text.length;
    const start = performance.now();
    const tick = (): void => {
      const p = Math.min(1, (performance.now() - start) / (dur * 1000));
      el.textContent = text.slice(0, Math.floor(p * n));
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    tick();
  });
}

export async function runIntro(): Promise<void> {
  const headEl = document.getElementById('intro-head') as HTMLElement;
  const bodyEl = document.getElementById('intro-body') as HTMLElement;
  for (const sec of INTRO) {
    playSound('blow', { channel: 'ui' }); // 원본 IntroTypeWriter: 대사 시작 시 Air-blow
    headEl.textContent = '';
    bodyEl.textContent = '';
    await typeText(headEl, sec.head, 0.5);
    await sleep(500);
    await typeText(bodyEl, sec.body, 0.5);
    await sleep(3000);
  }
  (document.getElementById('intro') as HTMLElement).classList.add('hidden');
  // 시작 튜토리얼 토스트 (원본 ToastUIManager.FirstToast — 모바일은 문구/색상 분기)
  if (isMobile) {
    toast('화면을 드래그하여 GolaGola', '#fff');
    setTimeout(() => toast('두 손가락으로 꾹 눌러 메뉴 토글', '#fff'), 3000);
  } else {
    toast('마우스를 움직여 GolaGola', '#ffff00');
    setTimeout(() => toast('[M] : 눌러서 마우스 숨기기 토글', '#ffff00'), 3000);
    setTimeout(() => toast('[TAB] : 눌러서 메뉴 토글', '#ffff00'), 6000);
  }
}

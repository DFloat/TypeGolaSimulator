// Toast (원본 ToastUI/ToastUIManager 메커니즘).
// Scene 실측값: 첫스택 +55px/이후 +35px, 최대 3스택, 4자 제한, 16px,
// 표시 3.0s, 이동/파괴 0.2s, 파괴 시 (-150, 0) 슬라이드.
import { LIMITS } from '../core/constants';
import { UNITY } from '../core/constants';
import { save } from '../core/storage';

function toastBox(): HTMLElement {
  const el = document.getElementById('toasts');
  if (!el) throw new Error('#toasts missing');
  return el;
}

// 원본 CutText: maxChars까지 한 글자씩 절단 후 '...'를 한 점씩 추가 (전체 MoveDuration).
function cutTextAnimated(el: HTMLElement, maxChars: number, durationMs: number): void {
  const original = el.textContent ?? '';
  if (original.length < maxChars) return;
  const totalSteps = original.length - maxChars + 3;
  const interval = durationMs / totalSteps;
  let i = original.length;
  const appendDots = (n: number): void => {
    if (!el.isConnected) return;
    el.textContent = `${original.slice(0, maxChars)}${'.'.repeat(n)}`;
    if (n < 3) setTimeout(() => appendDots(n + 1), interval);
  };
  const tickDown = (): void => {
    if (!el.isConnected) return;
    if (i > maxChars) {
      i--;
      el.textContent = original.slice(0, i);
      setTimeout(tickDown, interval);
    } else appendDots(1);
  };
  tickDown();
}

export function toast(msg: string, color?: string): void {
  if (!save.ToastMessageAllow) return;
  const c = color ?? '#ffff00'; // 원본 토스트는 노란색
  if (!msg) return;
  const box = toastBox();
  const stack = [...box.children].filter(
    (t): t is HTMLElement =>
      t instanceof HTMLElement && t.classList.contains('toast') && !t.dataset.dying,
  );
  stack.forEach((t, i) => {
    const n = parseInt(t.dataset.stacked ?? '0', 10) + 1;
    t.dataset.stacked = String(n);
    t.style.marginTop = `${(parseFloat(t.style.marginTop) || 0) + (i === 0 ? LIMITS.toastH1 : LIMITS.toastH2)}px`;
    if (n === 1) {
      // 첫 쌓임: 크기 축소 + 글자 애니메이션 절단
      t.style.fontSize = '16px';
      t.style.width = '110px';
      t.style.height = '30px';
      t.style.overflow = 'hidden';
      cutTextAnimated(t, LIMITS.toastChars, UNITY.toastMoveMs);
    }
    if (n >= LIMITS.toastMax) killToast(t);
  });
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.style.color = c;
  box.appendChild(el);
  void el.offsetWidth; // reflow 강제 → 초기(opacity 0) 상태 확정
  el.classList.add('show');
  setTimeout(() => killToast(el), UNITY.toastShowMs);
}

export function killToast(el: HTMLElement): void {
  if (el.dataset.dying) return;
  el.dataset.dying = '1';
  el.classList.remove('show');
  el.classList.add('dying'); // 파괴: 페이드 + (-150, 0) 슬라이드 (0.2s)
  setTimeout(() => el.remove(), UNITY.toastMoveMs);
}

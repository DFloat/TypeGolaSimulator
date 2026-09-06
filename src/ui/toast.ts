// Toast (원본 메커니즘 verbatim).
import { LIMITS } from '../core/constants';
import { save } from '../core/storage';

function toastBox(): HTMLElement {
  const el = document.getElementById('toasts');
  if (!el) throw new Error('#toasts missing');
  return el;
}

export function toast(msg: string, color?: string): void {
  if (!save.ToastMessageAllow) return;
  const c = color ?? '#ffff00'; // 원본 토스트는 노란색
  if (!msg) return;
  const box = toastBox();
  // 기존 토스트 스택 (원본: 첫 55px/이후 35px + 크기/폰트 축소 + 글자 4자 제한)
  const stack = [...box.children].filter(
    (t): t is HTMLElement =>
      t instanceof HTMLElement && t.classList.contains('toast') && !t.dataset.dying,
  );
  stack.forEach((t, i) => {
    t.dataset.stacked = String(parseInt(t.dataset.stacked ?? '0', 10) + 1);
    t.style.marginTop = `${+t.style.marginTop + (i === 0 ? LIMITS.toastH1 : LIMITS.toastH2)}px`;
    t.style.fontSize = '16px';
    t.style.padding = '0 10px';
    if ((t.textContent?.length ?? 0) > LIMITS.toastChars) {
      t.textContent = `${t.textContent?.slice(0, LIMITS.toastChars)}...`;
    }
    if (parseInt(t.dataset.stacked ?? '0', 10) >= LIMITS.toastMax) killToast(t, true);
  });
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.style.color = c;
  box.appendChild(el);
  void el.offsetWidth; // reflow 강제 → 초기(opacity 0) 상태 확정
  el.classList.add('show'); // rAF 의존 제거 — 즉시 표시
  setTimeout(() => killToast(el), LIMITS.toastDur);
}

export function killToast(el: HTMLElement, immediate?: boolean): void {
  if (el.dataset.dying) return;
  el.dataset.dying = '1';
  el.classList.remove('show');
  setTimeout(() => el.remove(), immediate ? LIMITS.toastKillFast : LIMITS.toastKill);
}

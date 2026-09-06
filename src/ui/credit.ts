// Credit roll (원본 Credit 씬 verbatim).
import { CREDITS } from '../data/credits';
import { startCreditBgm, stopCreditBgm } from '../audio/sounds';

let creditRAF: number | null = null;
let creditY = 0;
let creditPress = false;
let creditFactor = 1;

export function isCreditOpen(): boolean {
  return (document.getElementById('credit') as HTMLElement).classList.contains('open');
}

export function setCreditPress(v: boolean): void {
  creditPress = v;
  if (!v) creditFactor = 1;
}

export function showCredit(): void {
  startCreditBgm(); // 원본 크레딧 BGM (New End Beginning)
  const box = document.getElementById('credit-text') as HTMLElement;
  box.innerHTML = '';
  CREDITS.forEach(([title, details]) => {
    if (title) {
      const t = document.createElement('div');
      t.className = 'ct' + (title.startsWith('__GOLD__') ? ' gold' : '');
      t.textContent = title.replace('__GOLD__', '');
      box.appendChild(t);
    }
    details.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cd';
      if (Array.isArray(d)) {
        el.innerHTML = `<span class="c-color" style="color:${d[0]}">${d[1]}</span>`;
      } else el.textContent = d;
      box.appendChild(el);
    });
  });
  const hint = document.getElementById('credit-hint') as HTMLElement;
  hint.style.display = 'block';
  (document.getElementById('credit') as HTMLElement).classList.add('open');
  creditY = 0;
  creditPress = false;
  creditFactor = 1;
  box.style.transform = `translateY(${window.innerHeight}px)`;
  if (creditRAF) cancelAnimationFrame(creditRAF);
  const tick = (): void => {
    // 원본 CreditPrinter: speed 100 + 누르는 동안 factor += 50*dt (시간배율 가속)
    if (creditPress) creditFactor += 50 * (1 / 60);
    creditY += 100 * creditFactor * (1 / 60);
    box.style.transform = `translateY(${window.innerHeight - creditY}px)`;
    const last = box.lastElementChild;
    if (last && last.getBoundingClientRect().top < -50) closeCredit();
    else creditRAF = requestAnimationFrame(tick);
  };
  creditRAF = requestAnimationFrame(tick);
}

export function closeCredit(): void {
  stopCreditBgm();
  if (creditRAF) cancelAnimationFrame(creditRAF);
  creditRAF = null;
  (document.getElementById('credit') as HTMLElement).classList.remove('open');
  (document.getElementById('credit-hint') as HTMLElement).style.display = 'none';
}

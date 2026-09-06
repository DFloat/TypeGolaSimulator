// Version modal (원본 VersionInfo verbatim).
import { VERSIONS } from '../data/versions';
import { uiClick } from '../audio/sounds';

let verIdx = 0;

function renderVersion(): void {
  const v = VERSIONS[verIdx];
  (document.getElementById('vVer') as HTMLElement).textContent = v.ver;
  (document.getElementById('vDev') as HTMLElement).textContent =
    `개발자 코멘트 : ${v.dev.replace(/<br>/g, ' ')}`;
  (document.getElementById('modal-log') as HTMLElement).innerHTML = v.log;
}

export function nextVersion(): void {
  verIdx = (verIdx + 1) % VERSIONS.length;
  renderVersion();
  uiClick();
}

export function prevVersion(): void {
  verIdx = (verIdx - 1 + VERSIONS.length) % VERSIONS.length;
  renderVersion();
  uiClick();
}

export function openModal(): void {
  verIdx = 0;
  renderVersion();
  (document.getElementById('modal') as HTMLElement).classList.add('open');
  uiClick();
}

export function closeModal(): void {
  (document.getElementById('modal') as HTMLElement).classList.remove('open');
  uiClick();
}

export function initModal(): void {
  (document.getElementById('modalCloseBtn') as HTMLElement).addEventListener('click', closeModal);
  (document.getElementById('modalPrevBtn') as HTMLElement).addEventListener('click', prevVersion);
  (document.getElementById('modalNextBtn') as HTMLElement).addEventListener('click', nextVersion);
  (document.getElementById('modal') as HTMLElement).addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
}

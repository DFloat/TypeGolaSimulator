// ThatBox 3D software renderer + main draw() (원본 verbatim).
import { LIMITS, RAD } from '../core/constants';
import {
  bgColor,
  body,
  bodyLocal,
  fat,
  headLocal,
  isMobile,
  parts,
  thatBox,
  trails,
  type Trail,
} from '../core/state';
import { BOX_CORNER_UV, BOX_CORNER_VERT, BOX_TRIS, BOX_UV, BOX_VERTS } from '../data/mesh';
import { canvasWH, ctx, w2s } from './canvas';
import { sprites, spritesReady } from './sprites';

export function drawSprite(
  spr: CanvasImageSource,
  wx: number,
  wy: number,
  wUnits: number,
  angleDeg: number,
  px: number,
  py: number,
): void {
  const c = ctx();
  const { scale } = canvasWH();
  const [sx, sy] = w2s(wx, wy);
  const w = wUnits * scale;
  const img = spr as { width: number; height: number };
  const h = (img.height / img.width) * w;
  c.save();
  c.translate(sx, sy);
  c.rotate(-angleDeg * RAD); // Unity z+ 반시계 -> 캔버스 시계
  c.drawImage(spr, -px * w, -(1 - py) * h, w, h);
  c.restore();
}

// ThatBox 3D 소프트웨어 렌더 (원본 FBX 데이터 + 텍스처 affine 매핑)
export function drawTexturedTri(tex: CanvasImageSource, uv: number[], P: [number, number][]): void {
  const c = ctx();
  const t = tex as { width: number; height: number };
  const u0 = uv[0] * t.width;
  const v0 = (1 - uv[1]) * t.height;
  const u1 = uv[2] * t.width;
  const v1 = (1 - uv[3]) * t.height;
  const u2 = uv[4] * t.width;
  const v2 = (1 - uv[5]) * t.height;
  const x0 = P[0][0];
  const y0 = P[0][1];
  const x1 = P[1][0];
  const y1 = P[1][1];
  const x2 = P[2][0];
  const y2 = P[2][1];
  const det = (u1 - u0) * (v2 - v0) - (v1 - v0) * (u2 - u0);
  if (Math.abs(det) < 1e-9) return;
  const cx = (x0 + x1 + x2) / 3;
  const cy = (y0 + y1 + y2) / 3;
  const ex = 1.2;
  const ext = (x: number, y: number): [number, number] => {
    const dx = x - cx;
    const dy = y - cy;
    const l = Math.hypot(dx, dy) || 1;
    return [x + (dx / l) * ex, y + (dy / l) * ex];
  };
  const e0 = ext(x0, y0);
  const e1 = ext(x1, y1);
  const e2 = ext(x2, y2);
  const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det;
  const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det;
  const cc = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det;
  const d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
  const e = x0 - a * u0 - cc * v0;
  const f = y0 - b * u0 - d * v0;
  c.save();
  c.beginPath();
  c.moveTo(e0[0], e0[1]);
  c.lineTo(e1[0], e1[1]);
  c.lineTo(e2[0], e2[1]);
  c.closePath();
  c.clip();
  c.transform(a, b, cc, d, e, f);
  c.drawImage(tex, 0, 0);
  c.restore();
}

export const BOX_SCALE = 0.5; // 원본 대비 작게

export function drawThatBox(): void {
  const tex = sprites.boxTex;
  if (!tex) return;
  const { W, H, scale } = canvasWH();
  const yaw = thatBox.yaw;
  const cos = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const nv = BOX_CORNER_VERT.length;
  const P: [number, number, number][] = new Array(nv);
  for (let i = 0; i < nv; i++) {
    const vi = BOX_CORNER_VERT[i];
    const x = BOX_VERTS[vi * 3];
    const y = BOX_VERTS[vi * 3 + 1];
    const z = BOX_VERTS[vi * 3 + 2];
    const u = [x, z, -y]; // FBX z-up -> y-up
    const rx = (u[0] * cos + u[2] * sn) * BOX_SCALE;
    const ry = u[1] * BOX_SCALE;
    const rz = (-u[0] * sn + u[2] * cos) * BOX_SCALE;
    P[i] = [thatBox.x * scale + W / 2 + rx * scale, H / 2 - (thatBox.y + ry) * scale, rz];
  }
  const faces: { c0: number; c1: number; c2: number; zavg: number }[] = [];
  for (let i = 0; i < BOX_TRIS.length; i += 3) {
    const c0 = BOX_TRIS[i];
    const c1 = BOX_TRIS[i + 1];
    const c2 = BOX_TRIS[i + 2];
    const va = BOX_CORNER_VERT[c0];
    const vb = BOX_CORNER_VERT[c1];
    const vc = BOX_CORNER_VERT[c2];
    const a = [BOX_VERTS[va * 3], BOX_VERTS[va * 3 + 1], BOX_VERTS[va * 3 + 2]];
    const b = [BOX_VERTS[vb * 3], BOX_VERTS[vb * 3 + 1], BOX_VERTS[vb * 3 + 2]];
    const cc = [BOX_VERTS[vc * 3], BOX_VERTS[vc * 3 + 1], BOX_VERTS[vc * 3 + 2]];
    const a1 = [a[0], a[2], -a[1]];
    const b1 = [b[0], b[2], -b[1]];
    const cc1 = [cc[0], cc[2], -cc[1]];
    const n = [
      (b1[1] - a1[1]) * (cc1[2] - a1[2]) - (b1[2] - a1[2]) * (cc1[1] - a1[1]),
      (b1[2] - a1[2]) * (cc1[0] - a1[0]) - (b1[0] - a1[0]) * (cc1[2] - a1[2]),
      (b1[0] - a1[0]) * (cc1[1] - a1[1]) - (b1[1] - a1[1]) * (cc1[0] - a1[0]),
    ];
    const nz = -n[0] * sn + n[2] * cos;
    if (nz >= -0.02) continue;
    const zavg = (P[c0][2] + P[c1][2] + P[c2][2]) / 3;
    faces.push({ c0, c1, c2, zavg });
  }
  faces.sort((x, y) => y.zavg - x.zavg);
  for (const f of faces) {
    const uv = [
      BOX_UV[BOX_CORNER_UV[f.c0] * 2],
      BOX_UV[BOX_CORNER_UV[f.c0] * 2 + 1],
      BOX_UV[BOX_CORNER_UV[f.c1] * 2],
      BOX_UV[BOX_CORNER_UV[f.c1] * 2 + 1],
      BOX_UV[BOX_CORNER_UV[f.c2] * 2],
      BOX_UV[BOX_CORNER_UV[f.c2] * 2 + 1],
    ];
    drawTexturedTri(tex, uv, [
      [P[f.c0][0], P[f.c0][1]],
      [P[f.c1][0], P[f.c1][1]],
      [P[f.c2][0], P[f.c2][1]],
    ]);
  }
}

function drawTrailGhost(t: Trail): void {
  const c = ctx();
  const p = t.t / LIMITS.trailLife;
  const alpha = (1 - p) * LIMITS.trailAlpha;
  const sc = 1 + p * LIMITS.trailScale;
  const cA = Math.cos(t.rot * RAD);
  const sA = Math.sin(t.rot * RAD);
  const bx = t.x + bodyLocal.x * cA - bodyLocal.y * sA;
  const by = t.y + bodyLocal.x * sA + bodyLocal.y * cA;
  const hx = t.x + headLocal.x * cA - headLocal.y * sA;
  const hy = t.y + headLocal.x * sA + headLocal.y * cA;
  c.globalAlpha = alpha;
  if (sprites.body) drawSprite(sprites.body, bx, by, bodyLocal.w * sc, t.rot, bodyLocal.px, bodyLocal.py);
  if (sprites.head) drawSprite(sprites.head, hx, hy, headLocal.w * sc, t.rot, headLocal.px, headLocal.py);
  c.globalAlpha = 1;
}

export function draw(getHideBody: () => boolean): void {
  if (spritesReady() < 3) return;
  const c = ctx();
  const { W, H, scale } = canvasWH();
  const { r, g, b } = bgColor;
  c.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  c.fillRect(0, 0, W, H);

  // 잔상 (원본 AfterImage: 알파 감소 + 스케일 증가)
  trails.forEach(drawTrailGhost);

  if (thatBox.active) drawThatBox();

  if (fat.active && sprites.fat) {
    const img = sprites.fat as unknown as { width: number; height: number };
    const [sx, sy] = w2s(fat.x, fat.y);
    c.save();
    c.translate(sx, sy);
    c.rotate(fat.rot);
    const w = fat.size * scale * (isMobile ? LIMITS.mobileFatScale : 1);
    const h = (img.height / img.width) * w; // 모바일: 뚱뚱남 60% 크기
    c.drawImage(sprites.fat, -w / 2, -h / 2, w, h);
    c.restore();
  }

  if (!getHideBody()) {
    // 팔다리
    for (const p of parts) {
      const spr = sprites[p.spr];
      if (spr) drawSprite(spr, p.x, p.y, p.w, p.rot, p.px, p.py);
    }
    // 몸통 + 머리
    const cA = Math.cos(body.rot * RAD);
    const sA = Math.sin(body.rot * RAD);
    const bx = body.x + bodyLocal.x * cA - bodyLocal.y * sA;
    const by = body.y + bodyLocal.x * sA + bodyLocal.y * cA;
    const hx = body.x + headLocal.x * cA - headLocal.y * sA;
    const hy = body.y + headLocal.x * sA + headLocal.y * cA;
    if (sprites.body) drawSprite(sprites.body, bx, by, bodyLocal.w, body.rot, bodyLocal.px, bodyLocal.py);
    if (sprites.head) drawSprite(sprites.head, hx, hy, headLocal.w, body.rot, headLocal.px, headLocal.py);
  }
}

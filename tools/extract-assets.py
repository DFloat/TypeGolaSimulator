#!/usr/bin/env python3
"""Extract embedded base64 assets from the sync-reference single HTML
(O:/Projects/ChotaGolaSimulator/original-like.html) into binary files.

Lossless: base64 -> bytes, no re-encoding. Rerunnable (overwrites).
Usage: python tools/extract-assets.py [path-to-original-like.html]
"""
import base64
import os
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else (
    r"O:\Projects\ChotaGolaSimulator\original-like.html"
)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets")
DATA = os.path.join(ROOT, "src", "data")


def sniff(raw: bytes) -> str:
    if raw[:4] == b"RIFF":
        return ".wav"
    if raw[:3] == b"ID3" or raw[:2] == b"\xff\xfb":
        return ".mp3"
    if raw[:4] == b"\x1a\x45\xdf\xa3":
        return ".webm"
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if raw[:4] == b"wOF2":
        return ".woff2"
    return ".bin"


def main() -> None:
    with open(SRC, encoding="utf-8") as f:
        html = f.read()
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(DATA, exist_ok=True)
    manifest: list[tuple[str, int]] = []

    def save(name: str, b64: str) -> None:
        raw = base64.b64decode(b64)
        path = os.path.join(OUT, name + sniff(raw))
        with open(path, "wb") as f:
            f.write(raw)
        manifest.append((os.path.basename(path), len(raw)))

    # SND = { tick/tock/sw/bell/blow: '...', voice: ['...', ...] }
    m = re.search(r"const SND = \{(.*?)\n\};", html, re.S)
    assert m, "SND block not found"
    snd = m.group(1)
    for key in ("tick", "tock", "sw", "bell", "blow"):
        mm = re.search(key + r": '([A-Za-z0-9+/=]+)'", snd)
        assert mm, f"SND.{key} not found"
        save(key, mm.group(1))
    vm = re.search(r"voice: \[(.*?)\]", snd, re.S)
    assert vm, "SND.voice not found"
    voices = re.findall(r"'([A-Za-z0-9+/=]{100,})'", vm.group(1))
    assert voices, "no voice entries"
    for i, v in enumerate(voices):
        save(f"voice-{i}", v)

    # CREDIT_BGM (webm/opus expected)
    mm = re.search(r"const CREDIT_BGM = '([A-Za-z0-9+/=]+)'", html)
    assert mm, "CREDIT_BGM not found"
    save("credit-bgm", mm.group(1))

    # Images: data:image/png;base64,...
    for name in ("IMG_APPIE", "IMG_FAT", "IMG_TEX"):
        mm = re.search(
            name + r" = 'data:image/png;base64,([A-Za-z0-9+/=]+)'", html
        )
        assert mm, f"{name} not found"
        save(name.replace("IMG_", "").lower(), mm.group(1))

    # Font: data:font/woff2;base64,...
    mm = re.search(r"data:font/woff2;base64,([A-Za-z0-9+/=]+)", html)
    assert mm, "font not found"
    save("d2coding-bold", mm.group(1))

    # Mesh arrays (FBX-derived) -> mesh.ts (TS as-is)
    mesh_names = ["BOX_VERTS", "BOX_CORNER_VERT", "BOX_UV", "BOX_CORNER_UV", "BOX_TRIS"]
    with open(os.path.join(DATA, "mesh.ts"), "w", encoding="utf-8") as f:
        f.write("// Auto-extracted from original-like.html (Appie FBX data). DO NOT EDIT.\n")
        for n in mesh_names:
            mm = re.search(n + r" = \[([\s\S]*?)\];", html)
            assert mm, f"{n} not found"
            nums = re.sub(r"\s+", "", mm.group(1))
            f.write(f"export const {n}: number[] = [{nums}];\n")
            manifest.append((f"mesh.ts:{n}", len(nums.split(","))))

    print(f"extracted {len(manifest)} assets -> {OUT} (+ mesh.ts)")
    for name, size in manifest:
        print(f"  {size:>10}  {name}")


if __name__ == "__main__":
    main()

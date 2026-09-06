#!/usr/bin/env python3
"""Extract the <style> block + <body> shell from original-like.html.

- style.css: full CSS verbatim, except the embedded D2Coding base64 which is
  replaced by a public-asset URL (asset extracted by extract-assets.py).
- shell.html: body inner HTML (reference for index.html; onclick attrs are
  rewired to addEventListener in TS, see ui/*).
Usage: python tools/extract-shell.py [path-to-original-like.html]
"""
import os
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else (
    r"O:\Projects\ChotaGolaSimulator\original-like.html"
)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    with open(SRC, encoding="utf-8") as f:
        html = f.read()

    m = re.search(r"<style>([\s\S]*?)</style>", html)
    assert m, "style block not found"
    css = m.group(1)
    css, n = re.subn(
        r"src: url\(data:font/woff2;base64,[A-Za-z0-9+/=]+\)",
        "src: url('/assets/d2coding-bold.woff2')",
        css,
    )
    assert n == 1, f"expected 1 font embed, found {n}"
    with open(os.path.join(ROOT, "src", "style.css"), "w", encoding="utf-8") as f:
        f.write("/* Extracted from original-like.html. Font -> public asset. */\n" + css)
    print(f"style.css written ({len(css)} chars)")

    m = re.search(r"<body>([\s\S]*?)<script>", html)
    assert m, "body not found"
    with open(os.path.join(ROOT, "tools", "shell.html"), "w", encoding="utf-8") as f:
        f.write(m.group(1))
    print(f"tools/shell.html written ({len(m.group(1))} chars, reference only)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Validate Markdown files referenced by SUMMARY.md and basic local links."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
SUMMARY = SRC / "SUMMARY.md"

summary_text = SUMMARY.read_text(encoding="utf-8")
summary_links = re.findall(r"\[[^]]+\]\(([^)#?]+\.md)\)", summary_text)
missing = [link for link in summary_links if not (SRC / link).exists()]

if missing:
    print("SUMMARY.md 引用了不存在的文件：")
    for item in missing:
        print(f"  - {item}")
    raise SystemExit(1)

h1_missing = []
for link in summary_links:
    if link == "404.md":
        continue
    text = (SRC / link).read_text(encoding="utf-8")
    if not re.search(r"(?m)^#\s+\S", text):
        h1_missing.append(link)

if h1_missing:
    print("以下文章缺少一级标题：")
    for item in h1_missing:
        print(f"  - {item}")
    raise SystemExit(1)

print(f"检查通过：{len(summary_links)} 个导航页面均存在且包含一级标题。")

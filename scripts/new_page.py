#!/usr/bin/env python3
"""Create a Markdown article and insert it into mdBook SUMMARY.md.

Examples:
  python3 scripts/new_page.py e5 "组合逻辑学习笔记" combinational-logic
  python3 scripts/new_page.py essays "七月记录" 2026-07
"""
from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
SUMMARY = SRC / "SUMMARY.md"

SECTIONS = {
    "e5": {"directory": "ysyx/e5", "prefix": "ysyx/e5/", "indent": "    "},
    "ysyx": {"directory": "ysyx", "prefix": "ysyx/", "indent": "  "},
    "development": {"directory": "development", "prefix": "development/", "indent": "  "},
    "tools": {"directory": "tools", "prefix": "tools/", "indent": "  "},
    "essays": {"directory": "essays", "prefix": "essays/", "indent": "  "},
    "about": {"directory": "about", "prefix": "about/", "indent": "  "},
}


def valid_slug(value: str) -> str:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", value):
        raise argparse.ArgumentTypeError("slug 只能包含小写字母、数字和连字符")
    return value


def indent_width(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def insert_summary_link(section: str, title: str, relative_path: str) -> None:
    cfg = SECTIONS[section]
    lines = SUMMARY.read_text(encoding="utf-8").splitlines()
    parent_path = f"{cfg['directory']}/index.md"
    parent_index = next((i for i, line in enumerate(lines) if f"]({parent_path})" in line), None)
    if parent_index is None:
        raise RuntimeError(f"SUMMARY.md 中找不到栏目入口：{parent_path}")

    parent_indent = indent_width(lines[parent_index])
    child_indent = len(cfg["indent"])
    insert_at = parent_index + 1

    for i in range(parent_index + 1, len(lines)):
        line = lines[i]
        if not line.strip():
            continue
        if re.match(r"\s*- \[", line):
            width = indent_width(line)
            if width <= parent_indent:
                break
            insert_at = i + 1

    lines.insert(insert_at, f"{' ' * child_indent}- [{title}]({relative_path})")
    SUMMARY.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="新增 mdBook 文章并自动写入导航")
    parser.add_argument("section", choices=SECTIONS, help="文章栏目")
    parser.add_argument("title", help="文章标题")
    parser.add_argument("slug", type=valid_slug, help="英文文件名，不含 .md")
    args = parser.parse_args()

    cfg = SECTIONS[args.section]
    directory = SRC / cfg["directory"]
    directory.mkdir(parents=True, exist_ok=True)
    target = directory / f"{args.slug}.md"
    if target.exists():
        raise SystemExit(f"文件已存在：{target.relative_to(ROOT)}")

    target.write_text(
        f"# {args.title}\n\n"
        f"<div class=\"page-meta\">{date.today().isoformat()} · 持续更新</div>\n\n"
        "在这里写一句文章摘要。\n\n"
        "## 正文\n\n"
        "从这里开始写内容。\n\n"
        "## 总结\n\n"
        "- 结论一；\n"
        "- 结论二。\n",
        encoding="utf-8",
    )

    relative = target.relative_to(SRC).as_posix()
    insert_summary_link(args.section, args.title, relative)
    print(f"已创建：{target.relative_to(ROOT)}")
    print("已更新：src/SUMMARY.md")
    print("运行 mdbook serve --open 即可预览。")


if __name__ == "__main__":
    main()

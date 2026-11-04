#!/usr/bin/env python3
"""全站链接检查：扫描所有 .html 文件中的本地 href/src，验证目标文件存在。

用法: python3 tools/check_links.py
退出码: 0 = 全部有效; 1 = 存在坏链
"""

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:")


class LinkCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attr = {"a": "href", "link": "href", "script": "src", "img": "src"}.get(tag)
        if not attr:
            return
        for name, value in attrs:
            if name == attr and value:
                self.links.append((self.getpos()[0], value))


def check_file(path):
    """返回 [(行号, 链接, 解析后的目标路径)] 形式的坏链列表。"""
    collector = LinkCollector()
    collector.feed(path.read_text(encoding="utf-8"))
    broken = []
    for line, url in collector.links:
        url = url.strip()
        if not url or url.startswith("#") or url.startswith(SKIP_PREFIXES):
            continue
        parsed = urlparse(url)
        target = unquote(parsed.path)
        if not target:
            continue
        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            broken.append((line, url, resolved))
    return broken


def main():
    html_files = sorted(
        f for f in ROOT.rglob("*.html") if ".git" not in f.parts
    )
    total = 0
    failures = 0
    for path in html_files:
        broken = check_file(path)
        total += 1
        for line, url, resolved in broken:
            failures += 1
            rel = path.relative_to(ROOT)
            print("BROKEN {}:{}  {}  ->  {}".format(rel, line, url, resolved))
    if failures:
        print("\nFAIL: {} broken link(s) in {} file(s)".format(failures, total))
        return 1
    print("OK: {} file(s) checked, all links valid".format(total))
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Build standalone, human-readable HTML pages from ContextFoundry Markdown."""

import argparse
from html import escape, unescape
from html.parser import HTMLParser
import os
from pathlib import Path
import re
from urllib.parse import urlsplit, unquote

from markdown_it import MarkdownIt


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

CSS = """
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif; }
body { margin: 0; color: #172033; background: #f5f7fb; line-height: 1.65; }
main { max-width: 1060px; margin: 2rem auto; padding: 0 1.5rem 4rem; }
article { background: white; border: 1px solid #dfe5ef; border-radius: 14px; padding: 2.5rem 3rem; box-shadow: 0 8px 30px rgba(31, 45, 70, .06); }
h1, h2, h3 { color: #13284a; line-height: 1.25; scroll-margin-top: 1rem; }
h1 { font-size: 2.25rem; margin-top: 0; }
h2 { margin-top: 2.2rem; border-bottom: 1px solid #e7ebf2; padding-bottom: .35rem; }
a { color: #1559a6; }
code { background: #eef2f7; border-radius: 4px; padding: .12rem .3rem; }
pre { overflow-x: auto; padding: 1rem; border-radius: 8px; background: #172033; color: #f5f7fb; }
pre code { background: transparent; padding: 0; }
table { border-collapse: collapse; display: block; overflow-x: auto; width: 100%; }
th, td { border: 1px solid #dfe5ef; padding: .6rem .75rem; text-align: left; vertical-align: top; }
th { background: #eef3fa; }
blockquote { border-left: 4px solid #6a8fc2; margin-left: 0; padding-left: 1rem; color: #4d5b70; }
nav { color: #526278; font-size: .92rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: .5rem 1.2rem; }
.brand { font-weight: 750; color: #13284a; margin-right: auto; }
.toc { background: #f5f7fb; border: 1px solid #dfe5ef; padding: .75rem 1rem; margin: 1rem 0 2rem; border-radius: 8px; }
.toc ul { columns: 2; padding-left: 1.2rem; }
.toc li { break-inside: avoid; }
.toc summary { cursor: pointer; font-weight: 600; }
footer { font-size: .85rem; color: #526278; margin-top: 1rem; }
a:focus-visible, summary:focus-visible { outline: 3px solid #b45b00; outline-offset: 3px; }
p, li, td, a { overflow-wrap: anywhere; }
@media print { body { background: white; } main { margin: 0; max-width: none; } article { box-shadow: none; border: 0; padding: 0; } nav, .toc, footer { display: none; } pre { white-space: pre-wrap; } }
.meta { color: #66758a; font-size: .9rem; margin-bottom: 2rem; }
@media (max-width: 640px) { main { margin: 1rem auto; padding: 0 .75rem 2rem; } article { padding: 1.25rem; } h1 { font-size: 1.8rem; } .toc ul { columns: 1; } }
"""


def rewrite_markdown_links(rendered: str, source: Path, output: Path) -> str:
    """Rebase local links for the sibling HTML layout; redirect Markdown to HTML."""

    pattern = re.compile(r'(href|src)="([^"]+)"')

    def replace(match: re.Match[str]) -> str:
        attribute, href = match.groups()
        if href.startswith(("http://", "https://", "mailto:", "#", "/")):
            return match.group(0)

        target_text, fragment = (unescape(href).split("#", 1) + [""])[:2]
        target = (source.parent / target_text).resolve()
        if not target.is_file() or not target.is_relative_to(ROOT):
            return match.group(0)

        target_output = target.parent / "html" / f"{target.stem}.html" if target.suffix == ".md" else target
        relative = Path(os.path.relpath(target_output, output.parent))
        rewritten = str(relative)
        if fragment:
            rewritten += f"#{fragment}"
        return f'{attribute}="{escape(rewritten, quote=True)}"'

    return pattern.sub(replace, rendered)


def title_from_html(rendered: str, fallback: str) -> str:
    match = re.search(r"<h1\b[^>]*>(.*?)</h1>", rendered, flags=re.DOTALL)
    if not match:
        return fallback
    return re.sub(r"<[^>]+>", "", match.group(1)).strip()


def build_page(source: Path) -> tuple[Path, str]:
    output_dir = source.parent / "html"
    output = output_dir / f"{source.stem}.html"

    markdown = source.read_text(encoding="utf-8")
    parser = MarkdownIt("commonmark", {"html": False})
    parser.enable("table").enable("strikethrough")
    tokens = parser.parse(markdown)
    headings = []
    used = set()
    for index, token in enumerate(tokens):
        if token.type == "heading_open":
            label = tokens[index + 1].content
            base = re.sub(r"[^\w\s-]", "", label.lower())
            base = re.sub(r"\s+", "-", base).strip("-") or "section"
            slug = base
            suffix = 1
            while slug in used:
                slug = f"{base}-{suffix}"
                suffix += 1
            used.add(slug)
            token.attrSet("id", slug)
            if token.tag == "h2":
                headings.append((slug, label))
    rendered = parser.renderer.render(tokens, parser.options, {})
    rendered = rewrite_markdown_links(rendered, source, output)
    title = escape(unescape(title_from_html(rendered, source.stem.replace("-", " ").title())))
    source_link = Path(os.path.relpath(source, output.parent))
    index_link = os.path.relpath(DOCS / "html/index.html", output.parent)
    review_link = os.path.relpath(DOCS / "html/review-guide.html", output.parent)
    toc = ''
    if headings:
        items = ''.join(f'<li><a href="#{slug}">{escape(label)}</a></li>' for slug, label in headings)
        toc = f'<details class="toc" open><summary>On this page</summary><ul>{items}</ul></details>'
        rendered = re.sub(r"(</h1>)", lambda match: match.group(1) + toc, rendered, count=1)

    document = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · ContextFoundry</title>
  <style>{CSS}</style>
</head>
<body>
  <main>
    <nav aria-label="Documentation"><span class="brand">ContextFoundry</span><a href="{index_link}">Documentation</a><a href="{review_link}">Review guide</a><a href="{escape(str(source_link))}">Markdown source</a></nav>
    <article>
      {rendered}
    </article>
    <footer>CF-0.2 design review · Generated from {escape(str(source.relative_to(ROOT)))} · Proposed behavior unless explicitly stated.</footer>
  </main>
</body>
</html>
"""
    return output, document


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                raise ValueError(f"Duplicate HTML id: {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])


def validate(outputs):
    parsed = {}
    for path, content in outputs.items():
        page = Links()
        page.feed(content)
        parsed[path] = page
    for path, page in parsed.items():
        for href in page.links:
            link = urlsplit(href)
            if link.scheme or link.netloc:
                continue
            target = (path.parent / unquote(link.path)).resolve() if link.path else path
            if target not in outputs and not target.is_file():
                raise ValueError(f"Broken link in {path}: {href}")
            if link.fragment and target in parsed and unquote(link.fragment) not in parsed[target].ids:
                raise ValueError(f"Broken anchor in {path}: {href}")


def main() -> None:
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument("--check", action="store_true", help="verify generated parity without writing")
    args = arguments.parse_args()
    pages = [path for path in sorted(DOCS.rglob("*.md")) if "html" not in path.parts]
    pages.insert(0, ROOT / "README.md")
    outputs = dict(build_page(path) for path in pages)
    validate(outputs)
    if args.check:
        stale = [str(path.relative_to(ROOT)) for path, content in outputs.items()
                 if not path.is_file() or path.read_text(encoding="utf-8") != content]
        if stale:
            raise SystemExit("Stale HTML: " + ", ".join(stale))
    else:
        for path, content in outputs.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
    print(f"{'Verified' if args.check else 'Built'} {len(outputs)} HTML pages; local links and anchors valid")


if __name__ == "__main__":
    main()

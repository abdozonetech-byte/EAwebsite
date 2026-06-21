#!/usr/bin/env python3
"""
EA Portfolio CSS/JS architecture audit.

Purpose:
- Map CSS and JS files referenced by HTML pages.
- Record file sizes, media attributes, and load order.
- Protect future mobile/desktop split updates from accidental UI regressions.

Run from project root:
    python3 tools/ea_css_audit.py
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Dict, List, Any

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"
OUT_DIR.mkdir(exist_ok=True)

CSS_LINK_RE = re.compile(r'<link\b[^>]*rel=["\']stylesheet["\'][^>]*>', re.I)
HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.I)
MEDIA_RE = re.compile(r'media=["\']([^"\']+)["\']', re.I)
DATA_MOBILE_DEFER_RE = re.compile(r'data-mobile-defer-css', re.I)
SCRIPT_SRC_RE = re.compile(r'<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>', re.I)
INLINE_JS_ASSET_RE = re.compile(r'["\'](/assets/[^"\']+?\.js(?:\?[^"\']*)?)["\']')


def clean_url(url: str) -> str:
    return url.split("?", 1)[0]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def html_pages() -> List[Path]:
    return sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)


def file_info(rel_path: str) -> Dict[str, Any]:
    rel = rel_path.lstrip("/")
    path = ROOT / rel
    if path.exists():
        text = ""
        try:
            text = path.read_text(errors="ignore")
        except Exception:
            pass
        return {
            "path": rel_path,
            "exists": True,
            "bytes": path.stat().st_size,
            "kb": round(path.stat().st_size / 1024, 1),
            "sha256": sha256(path),
            "rule_blocks_estimate": text.count("{"),
            "media_max_width_count": len(re.findall(r"@media[^{}]*max-width", text, re.I)),
            "media_min_width_count": len(re.findall(r"@media[^{}]*min-width", text, re.I)),
        }
    return {"path": rel_path, "exists": False}


def main() -> None:
    pages = html_pages()
    css_usage: Dict[str, Dict[str, Any]] = {}
    js_usage: Dict[str, Dict[str, Any]] = {}
    page_map: Dict[str, Any] = {}

    for html_path in pages:
        rel_page = str(html_path.relative_to(ROOT))
        html = html_path.read_text(errors="ignore")
        css_links = []
        for tag in CSS_LINK_RE.findall(html):
            href_m = HREF_RE.search(tag)
            if not href_m:
                continue
            href = href_m.group(1)
            if not href.startswith("/assets/"):
                continue
            media_m = MEDIA_RE.search(tag)
            media = media_m.group(1) if media_m else "all"
            clean = clean_url(href)
            entry = {"href": clean, "media": media, "mobile_defer": bool(DATA_MOBILE_DEFER_RE.search(tag))}
            css_links.append(entry)
            css_usage.setdefault(clean, {"path": clean, "pages": set(), "media": set(), "mobile_defer_pages": set()})
            css_usage[clean]["pages"].add(rel_page)
            css_usage[clean]["media"].add(media)
            if entry["mobile_defer"]:
                css_usage[clean]["mobile_defer_pages"].add(rel_page)

        js_links = []
        for src in SCRIPT_SRC_RE.findall(html) + INLINE_JS_ASSET_RE.findall(html):
            if not src.startswith("/assets/"):
                continue
            clean = clean_url(src)
            js_links.append(clean)
            js_usage.setdefault(clean, {"path": clean, "pages": set()})
            js_usage[clean]["pages"].add(rel_page)

        page_map[rel_page] = {"css_load_order": css_links, "js_assets_detected": js_links}

    def normalize_usage(usage: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        result = []
        for path, data in sorted(usage.items()):
            info = file_info(path)
            data_out = dict(info)
            data_out["page_count"] = len(data.get("pages", []))
            data_out["pages"] = sorted(data.get("pages", []))
            if "media" in data:
                data_out["media"] = sorted(data.get("media", []))
                data_out["mobile_defer_page_count"] = len(data.get("mobile_defer_pages", []))
            result.append(data_out)
        return result

    report = {
        "project": "elboubakry.com / EA Portfolio",
        "update": "01 - CSS map and protection",
        "intent": "No visual change. This file locks current CSS/JS dependencies before future mobile/desktop separation.",
        "html_page_count": len(pages),
        "css_assets": normalize_usage(css_usage),
        "js_assets": normalize_usage(js_usage),
        "page_map": page_map,
    }

    out_json = OUT_DIR / "EA_UPDATE_01_CSS_LOAD_ORDER_LOCK.json"
    out_json.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    total_css_bytes = sum(i.get("bytes", 0) for i in report["css_assets"] if i.get("exists"))
    homepage = page_map.get("index.html", {})
    homepage_css = homepage.get("css_load_order", [])
    homepage_css_bytes = 0
    for item in homepage_css:
        p = ROOT / item["href"].lstrip("/")
        if p.exists():
            homepage_css_bytes += p.stat().st_size

    md = []
    md.append("# EA Update 01 — CSS Map & Protection\n")
    md.append("**Scope:** audit/protection only. No UI, UX, animation, SEO, tracking, form, sitemap, redirect, or content change.\n")
    md.append("## What this update does\n")
    md.append("- Creates a locked map of current CSS load order for every HTML page.\n")
    md.append("- Records file sizes, media attributes, and SHA-256 hashes before future splitting.\n")
    md.append("- Identifies which files are safe candidates for future mobile/desktop separation.\n")
    md.append("- Adds a repeatable audit script: `tools/ea_css_audit.py`.\n")
    md.append("\n## Current project facts\n")
    md.append(f"- HTML pages detected: **{len(pages)}**.\n")
    md.append(f"- CSS assets referenced by pages: **{len(report['css_assets'])}**.\n")
    md.append(f"- JS assets detected by pages: **{len(report['js_assets'])}**.\n")
    md.append(f"- Total referenced CSS across the project: **{round(total_css_bytes/1024,1)} KB raw**.\n")
    md.append(f"- Homepage CSS load order count: **{len(homepage_css)} CSS links**.\n")
    md.append(f"- Homepage CSS referenced size if all matching files are counted: **{round(homepage_css_bytes/1024,1)} KB raw**.\n")
    md.append("\n## Main diagnosis\n")
    md.append("The website can be separated safely into desktop and mobile CSS, but not by deleting old files suddenly. The current UI is protected by a long cascade of files where later files override earlier files. Future updates must preserve load order until each section is migrated and visually checked.\n")
    md.append("\n## Recommended separation model\n")
    md.append("```text\nassets/css/core/base.css\nassets/css/pages/home-base.css\nassets/css/pages/home-mobile.css   media=(max-width: 768px)\nassets/css/pages/home-desktop.css  media=(min-width: 769px)\nassets/css/pages/services-base.css\nassets/css/pages/services-mobile.css\nassets/css/pages/services-desktop.css\nassets/css/pages/insights-base.css\nassets/css/pages/insights-mobile.css\nassets/css/pages/insights-desktop.css\n```\n")
    md.append("\n## Priority files to split later\n")
    md.append("| Priority | File | Reason |\n|---|---|---|\n")
    for priority, path, reason in [
        (1, "/assets/css/elboubakry-growth-system.css", "Very large homepage file with many mobile and desktop rules."),
        (2, "/assets/css/main.css", "Large legacy theme file with many global and responsive rules."),
        (3, "/assets/css/elboubakry-final-polish-pass.css", "Late override file; important for current visual stability."),
        (4, "/assets/css/elboubakry-upgrade-07-uiux.css", "Late override file used on many pages."),
        (5, "/assets/css/vendor/bootstrap.min.css", "Large vendor CSS; must be reduced only after checking used components."),
        (6, "/assets/css/vendor/remixicon.css", "Large icon font CSS; can be optimized later only if icon usage is mapped."),
    ]:
        p = ROOT / path.lstrip("/")
        kb = f"{round(p.stat().st_size/1024,1)} KB" if p.exists() else "missing"
        md.append(f"| {priority} | `{path}` ({kb}) | {reason} |\n")
    md.append("\n## Safe rules for Update 02\n")
    md.append("- Start with homepage mobile only.\n")
    md.append("- Do not edit desktop selectors.\n")
    md.append("- Do not remove animations.\n")
    md.append("- Do not change HTML content, URLs, schema, GA4, Meta Pixel, form logic, or sitemap.\n")
    md.append("- Move mobile-only rules progressively into a new controlled mobile file, then compare screenshots.\n")
    md.append("\n## Files added by Update 01\n")
    md.append("- `docs/EA_UPDATE_01_CSS_LOAD_ORDER_LOCK.json`\n")
    md.append("- `docs/EA_UPDATE_01_CSS_DEVICE_SEPARATION_AUDIT.md`\n")
    md.append("- `tools/ea_css_audit.py`\n")

    (OUT_DIR / "EA_UPDATE_01_CSS_DEVICE_SEPARATION_AUDIT.md").write_text("".join(md), encoding="utf-8")
    print(f"Wrote {out_json.relative_to(ROOT)}")
    print(f"Wrote {Path('docs/EA_UPDATE_01_CSS_DEVICE_SEPARATION_AUDIT.md')}")


if __name__ == "__main__":
    main()

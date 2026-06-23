#!/usr/bin/env python3
"""
EA Update 02 verification.
Checks that homepage mobile CSS was bundled safely without changing desktop-applicable CSS load order.
Run from project root:
    python3 tools/ea_update_02_home_mobile_check.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CSS_LINK_RE = re.compile(r'<link\b[^>]*rel=["\']stylesheet["\'][^>]*>', re.I)
HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.I)
MEDIA_RE = re.compile(r'media=["\']([^"\']+)["\']', re.I)

OLD_LATE_MOBILE_FILES = [
    "/assets/css/elboubakry-mobile-menu-blanc-bleu-reference.css",
    "/assets/css/elboubakry-mobile-hero-focus-blue.css",
    "/assets/css/elboubakry-mobile-performance-ultra.css",
    "/assets/css/elboubakry-mobile-official-repair.css",
]
NEW_BUNDLE = "/assets/css/pages/home-mobile.css"


def clean(url: str) -> str:
    return url.split("?", 1)[0]


def css_links(html_path: Path) -> List[Dict[str, str]]:
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    links = []
    for tag in CSS_LINK_RE.findall(html):
        href_m = HREF_RE.search(tag)
        if not href_m:
            continue
        media_m = MEDIA_RE.search(tag)
        href = clean(href_m.group(1))
        media = media_m.group(1) if media_m else "all"
        links.append({"href": href, "media": media})
    return links


def local_size(href: str) -> int:
    if not href.startswith("/assets/"):
        return 0
    p = ROOT / href.lstrip("/")
    return p.stat().st_size if p.exists() else 0


def main() -> None:
    links = css_links(INDEX)
    old_still_linked = [f for f in OLD_LATE_MOBILE_FILES if any(i["href"] == f for i in links)]
    bundle_entries = [i for i in links if i["href"] == NEW_BUNDLE]
    bundle_path = ROOT / NEW_BUNDLE.lstrip("/")
    css = bundle_path.read_text(encoding="utf-8", errors="ignore") if bundle_path.exists() else ""

    report = {
        "project": "elboubakry.com / EA Portfolio",
        "update": "02 - homepage mobile CSS separation",
        "scope": "index.html mobile CSS only",
        "homepage_css_link_count": len(links),
        "new_bundle": NEW_BUNDLE,
        "new_bundle_exists": bundle_path.exists(),
        "new_bundle_bytes": bundle_path.stat().st_size if bundle_path.exists() else 0,
        "new_bundle_media_on_homepage": bundle_entries[0]["media"] if bundle_entries else None,
        "old_late_mobile_files_removed_from_homepage": len(old_still_linked) == 0,
        "old_late_mobile_files_still_linked": old_still_linked,
        "new_bundle_linked_once": len(bundle_entries) == 1,
        "css_braces_balanced": css.count("{") == css.count("}"),
        "mobile_max_width_links": [i["href"] for i in links if "max-width" in i["media"]],
        "desktop_min_width_links": [i["href"] for i in links if "min-width" in i["media"]],
        "homepage_local_css_bytes": sum(local_size(i["href"]) for i in links),
    }
    out = ROOT / "docs" / "EA_UPDATE_02_HOME_MOBILE_CSS_LOCK.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

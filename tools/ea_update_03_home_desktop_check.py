#!/usr/bin/env python3
"""EA Update 03 verification: homepage desktop CSS separation."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
OLD_DESKTOP = "/assets/css/elboubakry-desktop-performance-safe.css"
NEW_DESKTOP = "/assets/css/pages/home-desktop.css"


def css_links() -> list[dict]:
    soup = BeautifulSoup(INDEX.read_text(encoding="utf-8"), "html.parser")
    links: list[dict] = []
    for link in soup.find_all("link"):
        rel = link.get("rel") or []
        if isinstance(rel, str):
            rel = [rel]
        if "stylesheet" not in rel:
            continue
        href = link.get("href", "")
        path = href.split("?", 1)[0]
        media = link.get("media", "")
        local = path.startswith("/assets/css/")
        size = None
        sha = None
        exists = False
        if local:
            file_path = ROOT / path.lstrip("/")
            exists = file_path.exists()
            if exists:
                data = file_path.read_bytes()
                size = len(data)
                sha = hashlib.sha256(data).hexdigest()
        links.append(
            {
                "position": len(links) + 1,
                "href": href,
                "path": path,
                "media": media,
                "local": local,
                "exists": exists,
                "bytes": size,
                "sha256": sha,
            }
        )
    return links


def main() -> int:
    links = css_links()
    new_file = ROOT / NEW_DESKTOP.lstrip("/")
    old_file = ROOT / OLD_DESKTOP.lstrip("/")
    new_text = new_file.read_text(encoding="utf-8") if new_file.exists() else ""
    checks = {
        "homepage_css_link_count": len(links),
        "new_bundle_exists": new_file.exists(),
        "new_bundle_linked_once": sum(1 for item in links if item["path"] == NEW_DESKTOP) == 1,
        "new_bundle_media": next((item["media"] for item in links if item["path"] == NEW_DESKTOP), None),
        "old_desktop_file_not_linked": not any(item["path"] == OLD_DESKTOP for item in links),
        "old_desktop_file_still_available": old_file.exists(),
        "old_new_css_hash_equal": old_file.exists() and new_file.exists() and hashlib.sha256(old_file.read_bytes()).hexdigest() == hashlib.sha256(new_file.read_bytes()).hexdigest(),
        "css_braces_balanced": new_text.count("{") == new_text.count("}"),
        "mobile_max_width_links": [item["path"] for item in links if "max-width: 768px" in (item["media"] or "")],
        "desktop_min_width_links": [item["path"] for item in links if "min-width: 769px" in (item["media"] or "")],
        "homepage_local_css_bytes": sum(item["bytes"] or 0 for item in links if item["local"]),
    }
    print(json.dumps(checks, indent=2, ensure_ascii=False))
    required = [
        checks["new_bundle_exists"],
        checks["new_bundle_linked_once"],
        checks["new_bundle_media"] == "(min-width: 769px)",
        checks["old_desktop_file_not_linked"],
        checks["old_desktop_file_still_available"],
        checks["old_new_css_hash_equal"],
        checks["css_braces_balanced"],
    ]
    return 0 if all(required) else 1


if __name__ == "__main__":
    raise SystemExit(main())

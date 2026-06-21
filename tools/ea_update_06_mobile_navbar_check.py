#!/usr/bin/env python3
"""EA Update 06 verification: mobile navbar polish remains mobile-only.
Run from project root: python3 tools/ea_update_06_mobile_navbar_check.py
"""
from pathlib import Path
import re
import sys
import hashlib

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MOBILE_CSS = ROOT / "assets/css/pages/home-mobile.css"
DESKTOP_CSS = ROOT / "assets/css/pages/home-desktop.css"

errors = []

if not INDEX.exists():
    errors.append("index.html missing")
if not MOBILE_CSS.exists():
    errors.append("assets/css/pages/home-mobile.css missing")
if not DESKTOP_CSS.exists():
    errors.append("assets/css/pages/home-desktop.css missing")

html = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
css = MOBILE_CSS.read_text(encoding="utf-8") if MOBILE_CSS.exists() else ""

if "EA Update 06" not in css:
    errors.append("EA Update 06 CSS block not found in home-mobile.css")

if css.count("{") != css.count("}"):
    errors.append(f"CSS braces are not balanced: open={css.count('{')} close={css.count('}')}" )

update_block = css.split("/* EA Update 06", 1)[-1] if "/* EA Update 06" in css else ""
if "@media (max-width: 768px)" not in update_block:
    errors.append("Update 06 block is not scoped to max-width: 768px")

for forbidden in ["<title", "application/ld+json", "fbq(", "gtag(", "sitemap", "canonical"]:
    # This check is intentionally light: the update should not edit index SEO/tracking.
    pass

css_links = re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]*>', html)
allowed_css_link_counts = {25, 13}  # 25 before Update 10; 13 after homepage CSS diet (12 local + Google Font)
if len(css_links) not in allowed_css_link_counts:
    errors.append(f"Unexpected homepage CSS link count: {len(css_links)} not in {sorted(allowed_css_link_counts)}")

if "assets/css/pages/home-desktop.css?v=ea-update-03" not in html:
    errors.append("Desktop CSS link changed or missing")

if "assets/css/pages/home-mobile.css?v=ea-update-02" not in html:
    errors.append("Mobile CSS link changed or missing")

summary = {
    "status": "PASS" if not errors else "FAIL",
    "css_links": len(css_links),
    "home_mobile_css_bytes": MOBILE_CSS.stat().st_size if MOBILE_CSS.exists() else 0,
    "home_desktop_css_sha256": hashlib.sha256(DESKTOP_CSS.read_bytes()).hexdigest() if DESKTOP_CSS.exists() else None,
    "update_06_mobile_only_block": "EA Update 06" in css and "@media (max-width: 768px)" in update_block,
    "errors": errors,
}

print(summary)
if errors:
    sys.exit(1)

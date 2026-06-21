#!/usr/bin/env python3
"""EA Update 11 verification: homepage shared CSS bundles minified safely.
Scope: index.html + assets/css/pages/home-shared-pre.css + home-shared-post.css only.
"""
from __future__ import annotations
from pathlib import Path
import hashlib, json, re, sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
PRE = ROOT / "assets/css/pages/home-shared-pre.css"
POST = ROOT / "assets/css/pages/home-shared-post.css"
LOCK = ROOT / "docs/EA_UPDATE_11_HOMEPAGE_CSS_SAFE_MINIFY_LOCK.json"

errors: list[str] = []
html = INDEX.read_text(encoding="utf-8", errors="ignore") if INDEX.exists() else ""

required_hrefs = [
    "/assets/css/pages/home-shared-pre.css?v=ea-update-11",
    "/assets/css/pages/home-shared-post.css?v=ea-update-11",
    "/assets/css/elboubakry-mobile-performance-safe.css?v=20260617-menu-clean",
    "/assets/css/pages/home-mobile.css?v=ea-update-02",
    "/assets/css/pages/home-desktop.css?v=ea-update-03",
]
for href in required_hrefs:
    if href not in html:
        errors.append(f"Missing expected homepage CSS link: {href}")

# Ensure device separation from previous updates remains intact.
if 'href="/assets/css/pages/home-mobile.css?v=ea-update-02" media="(max-width: 768px)"' not in html:
    errors.append("Mobile CSS media link changed or missing")
if 'href="/assets/css/pages/home-desktop.css?v=ea-update-03" media="(min-width: 769px)"' not in html:
    errors.append("Desktop CSS media link changed or missing")

stylesheet_links = [m.group(0) for m in re.finditer(r'<link[^>]*>', html) if 'rel="stylesheet"' in m.group(0)]
if len(stylesheet_links) != 13:
    errors.append(f"Unexpected homepage stylesheet count including Google Font: {len(stylesheet_links)}")

for p in [PRE, POST]:
    if not p.exists():
        errors.append(f"Missing bundle: {p.relative_to(ROOT)}")
        continue
    css = p.read_text(encoding="utf-8", errors="ignore")
    if css.count("{") != css.count("}"):
        errors.append(f"Unbalanced braces in {p.name}")
    if "/*" in css or "*/" in css:
        errors.append(f"CSS comments still present in minified bundle: {p.name}")
    # This update only minifies text; it must not leave empty files.
    if p.stat().st_size < 1000:
        errors.append(f"Bundle unexpectedly small: {p.name}")

lock = {}
if LOCK.exists():
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    if PRE.exists() and PRE.stat().st_size != lock.get("after", {}).get("home_shared_pre_bytes"):
        errors.append("home-shared-pre.css size does not match lock")
    if POST.exists() and POST.stat().st_size != lock.get("after", {}).get("home_shared_post_bytes"):
        errors.append("home-shared-post.css size does not match lock")
else:
    errors.append("Update 11 lock file missing")

summary = {
    "status": "PASS" if not errors else "FAIL",
    "homepage_stylesheets_including_google_font": len(stylesheet_links),
    "home_shared_pre_bytes": PRE.stat().st_size if PRE.exists() else None,
    "home_shared_post_bytes": POST.stat().st_size if POST.exists() else None,
    "home_shared_pre_sha256": hashlib.sha256(PRE.read_bytes()).hexdigest() if PRE.exists() else None,
    "home_shared_post_sha256": hashlib.sha256(POST.read_bytes()).hexdigest() if POST.exists() else None,
    "errors": errors,
}
print(json.dumps(summary, indent=2, ensure_ascii=False))
if errors:
    sys.exit(1)

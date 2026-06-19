#!/usr/bin/env python3
"""EA Update 04 check: verify Remix Icon subset coverage and HTML links."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "assets/css/vendor/remixicon.css"
SUBSET = ROOT / "assets/css/vendor-subsets/remixicon-site-subset.css"
LOCK = ROOT / "docs/EA_UPDATE_04_REMIXICON_SUBSET_LOCK.json"

ri_pattern = re.compile(r"\bri-[a-z0-9-]+\b")
rule_pattern = lambda cls: re.compile(r"\." + re.escape(cls) + r":before\s*\{")

classes = set()
for glob in ("*.html", "assets/js/*.js", "assets/css/*.css"):
    for path in ROOT.rglob(glob) if glob == "*.html" else ROOT.glob(glob):
        if path.name == "remixicon.css" or "vendor-subsets" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        classes.update(ri_pattern.findall(text))

utility = {"ri-lg", "ri-xl", "ri-xxs", "ri-xs", "ri-sm", "ri-fw"}
icon_classes = sorted(c for c in classes if c not in utility)
orig = ORIGINAL.read_text(encoding="utf-8", errors="ignore")
subset = SUBSET.read_text(encoding="utf-8", errors="ignore")

missing_from_subset = []
invalid_in_original = []
for cls in icon_classes:
    if not rule_pattern(cls).search(orig):
        invalid_in_original.append(cls)
        continue
    if not rule_pattern(cls).search(subset):
        missing_from_subset.append(cls)

active_full_links = []
active_subset_links = []
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8", errors="ignore")
    if "/assets/css/vendor/remixicon.css" in text:
        active_full_links.append(str(html.relative_to(ROOT)))
    if "/assets/css/vendor-subsets/remixicon-site-subset.css" in text:
        active_subset_links.append(str(html.relative_to(ROOT)))

result = {
    "original_bytes": ORIGINAL.stat().st_size,
    "subset_bytes": SUBSET.stat().st_size,
    "saved_bytes_per_page": ORIGINAL.stat().st_size - SUBSET.stat().st_size,
    "site_ri_tokens_found": len(classes),
    "active_full_remixicon_links": active_full_links,
    "active_subset_links_count": len(active_subset_links),
    "missing_valid_rules_from_subset": missing_from_subset,
    "tokens_not_present_in_original_remixicon": invalid_in_original,
    "status": "PASS" if not active_full_links and not missing_from_subset else "FAIL",
}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(0 if result["status"] == "PASS" else 1)

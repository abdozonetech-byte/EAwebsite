from pathlib import Path
import re, sys
root = Path(__file__).resolve().parents[1]
errors = []
required = [
    'assistant-ia-maroc/index.html',
    'assets/css/namaa-ai.css',
    'assets/js/namaa-ai.js',
    'assets/css/namaa-ai-floating.css',
    'assets/data/namaa-ai/namaa_ai_identity.json',
]
for rel in required:
    if not (root / rel).exists():
        errors.append(f'Missing {rel}')
page = (root / 'assistant-ia-maroc/index.html').read_text(encoding='utf-8')
if 'https://elboubakry.com/assistant-ia-maroc/' not in page:
    errors.append('Canonical/new page URL missing from Namaa page')
js = (root / 'assets/js/namaa-ai.js').read_text(encoding='utf-8')
for forbidden in ['fetch(', 'XMLHttpRequest', 'openai', 'gemini', 'generativelanguage']:
    if forbidden.lower() in js.lower():
        errors.append(f'Forbidden API/network marker in Namaa JS: {forbidden}')
if 'https://elboubakry.com/assistant-ia-maroc/' not in (root / 'sitemap.xml').read_text(encoding='utf-8'):
    errors.append('Sitemap missing Namaa AI URL')
htmls = list(root.rglob('*.html'))
float_count = sum('ea-namaa-float' in p.read_text(encoding='utf-8', errors='ignore') for p in htmls if 'assistant-ia-maroc' not in p.parts)
nav_count = sum('ea-namaa-nav-link' in p.read_text(encoding='utf-8', errors='ignore') for p in htmls if 'assistant-ia-maroc' not in p.parts)
if float_count < 40:
    errors.append(f'Floating button appears on too few pages: {float_count}')
if nav_count < 40:
    errors.append(f'Navbar link appears on too few pages: {nav_count}')
if errors:
    print('FAIL: Namaa Update 01 check')
    for err in errors:
        print('-', err)
    sys.exit(1)
print('PASS: Namaa Update 01 UI/UX page only check')
print(f'HTML pages checked: {len(htmls)}')
print(f'Floating button pages: {float_count}')
print(f'Navbar link pages: {nav_count}')

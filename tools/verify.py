#!/usr/bin/env python3
"""Static handoff checks. Python 3 standard library; Node.js enables JS syntax checks."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, shutil, subprocess, sys, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors = []
refs = []
source_files = sorted(p for p in ROOT.rglob('*') if p.suffix.lower() in {'.html','.css','.js','.cjs','.svg'} and p.is_file())
data_pattern = re.compile(r'data:(?:[\w.+-]+/[\w.+-]+)?(?:;[\w.+-]+(?:=[\w.+-]+)?)*,', re.I)

def check_ref(value, source, base=None):
    value = value.strip()
    parsed = urlsplit(value)
    if not value or value.startswith('#') or parsed.scheme or parsed.netloc:
        return
    path = unquote(parsed.path)
    if not path:
        return
    target = ((base or source.parent) / path).resolve()
    refs.append((str(source.relative_to(ROOT)), value))
    if not target.is_relative_to(ROOT) or not target.is_file():
        errors.append(f'Missing or out-of-package asset: {source.relative_to(ROOT)} -> {value}')

class Resources(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.source = source
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ['src', 'href', 'poster', 'data']:
            if key in attrs:
                check_ref(attrs[key], self.source)
        if tag == 'img' and 'alt' not in attrs:
            errors.append(f'Missing image alt: {self.source.relative_to(ROOT)}')
        if tag == 'audio':
            errors.append(f'Unexpected audio element: {self.source.relative_to(ROOT)}')

for source in source_files:
    text = source.read_text(encoding='utf-8')
    if data_pattern.search(text) or ';base64,' in text:
        errors.append(f'Embedded data payload: {source.relative_to(ROOT)}')
    if source.suffix == '.html':
        Resources(source).feed(text)
    elif source.suffix == '.svg':
        tree = ET.fromstring(text)
        for node in tree.iter():
            for key, value in node.attrib.items():
                if key in {'href', '{http://www.w3.org/1999/xlink}href'}:
                    check_ref(value, source)
    if source.suffix in {'.css', '.svg', '.html'}:
        for match in re.finditer(r'url\(\s*[\'\"]?([^\s\)\'\"]+)', text):
            check_ref(match[1], source)
    if source.suffix in {'.js', '.cjs'}:
        # Image.src in this viewer resolves from viewer.html, not the module directory.
        for match in re.finditer(r'[\'\"]((?:assets/|viewer/|\./|\.\./)[^\'\"\r\n]+)[\'\"]', text):
            check_ref(match[1], source, ROOT)

viewer = (ROOT/'viewer.html').read_text()
assert all(f'data-v="{key}"' in viewer for key in ['koi','seiza','tetsudo','taiyo','empty','water','waterice'])
assert 'toggle-rotation' in viewer
assert not any(p.suffix.lower() in {'.mp3','.wav','.ogg','.m4a','.aac'} for p in ROOT.rglob('*'))
assert not any('standalone' in p.name for p in ROOT.rglob('*'))

node = shutil.which('node')
js_files = [p for p in source_files if p.suffix in {'.js', '.cjs'}]
if node:
    for source in js_files:
        proc = subprocess.run([node, '--check', str(source)], capture_output=True, text=True)
        if proc.returncode:
            errors.append(f'JS syntax: {source.relative_to(ROOT)}: {proc.stderr.strip()}')
    print(f'JavaScript syntax: {len(js_files)} files checked')
else:
    print('JavaScript syntax: SKIPPED (Node.js is not installed)')
print(f'Source files checked for embedded payloads: {len(source_files)}')
print(f'Local asset references checked: {len(refs)} ({len(set(refs))} distinct source/target pairs)')
print('3D options: 4 patterns + 3 content states present in source')
print('Music assets/elements: absent')
if errors:
    print('\n'.join(errors));sys.exit(1)
print('PASS: static checks only; browser/WebGL behavior needs separate verification')

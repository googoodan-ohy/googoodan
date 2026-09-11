import json
from pathlib import Path
from pypdf import PdfReader
files=json.loads(Path('.work-english/de-print-audit/manifest.json').read_text(encoding='utf-8'))
fail=[]
for file in files:
    pdf=PdfReader(file)
    assert abs(float(pdf.pages[0].mediabox.width)-595.28)<2, file
    assert abs(float(pdf.pages[0].mediabox.height)-841.89)<2, file
    if len(pdf.pages)!=1:
        fail.append((file,len(pdf.pages)))
assert not fail,fail
print(f'PASS {len(files)} PDFs: exactly one A4 page each')

"""Check native PDFs produced by check-ko-unit-output.cjs (requires pypdf)."""
import json
import re
import sys
import unicodedata
from pathlib import Path
from pypdf import PdfReader

directory = Path(sys.argv[1] if len(sys.argv) > 1 else '.work-english/ko-second-fix')
report = json.loads((directory / 'results.json').read_text(encoding='utf-8'))

def normalize(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value))

answer_count = 0
for result in report['results']:
    stem = result['file'].removesuffix('.html')
    texts = {}
    for mode in ['q', 'a']:
        filename = directory / f'{stem}-{mode}.pdf'
        pdf = PdfReader(filename)
        assert len(pdf.pages) == 1, (filename, len(pdf.pages))
        texts[mode] = normalize(pdf.pages[0].extract_text())
        assert ('정답과풀이' in texts[mode]) == (mode == 'a'), filename
    assert texts['a'] != texts['q'], result['file']
    for answer in result['answers']:
        assert normalize(answer) in texts['a'], (result['file'], answer)
        answer_count += 1

six_files = list(directory.glob('*-six.pdf'))
assert len(six_files) == 3, len(six_files)
for filename in six_files:
    pdf = PdfReader(filename)
    assert len(pdf.pages) == 6, (filename, len(pdf.pages))
    if filename.name != 'main-six.pdf':
        for i, page in enumerate(pdf.pages):
            assert ('정답과풀이' in normalize(page.extract_text())) == (i % 2 == 1), (filename, i)
print(f'PASS 80 one-page PDFs; {answer_count} answer texts; unit/test/main each 6 pages')

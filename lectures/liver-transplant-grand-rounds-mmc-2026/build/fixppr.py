# pptxgenjs writes an <a:pPr> before every run in a multi-run paragraph. Keep only the first.
import sys, re, zipfile, shutil, os
src = sys.argv[1]; tmp = src + ".tmp"
pat_p = re.compile(r'<a:p>(.*?)</a:p>', re.S)
pat_ppr = re.compile(r'<a:pPr\b[^>]*/>|<a:pPr\b[^>]*>.*?</a:pPr>', re.S)
n = 0
def fix_p(m):
    global n
    inner = m.group(1)
    first = inner.find('<a:r>')
    if first < 0: return m.group(0)
    head, tail = inner[:first], inner[first:]
    new_tail, k = pat_ppr.subn('', tail)
    n += k
    return '<a:p>' + head + new_tail + '</a:p>'
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename.startswith('ppt/slides/slide') and item.filename.endswith('.xml'):
            data = pat_p.sub(fix_p, data.decode('utf-8')).encode('utf-8')
        zout.writestr(item, data)
shutil.move(tmp, src)
print("removed", n, "stray pPr")

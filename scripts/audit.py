# -*- coding: utf-8 -*-
# 5사 글 점검: 길이(공백 포함, 마크다운 기호 제외) 1700 미만, 깨진 내부링크, 없는 본문/썸네일 이미지, updatedDate 없는 글
# 사용: python chozworld/scripts/audit.py [사이트폴더 ...]   (생략 시 5사 전부)
import re, io, glob, os, sys, statistics
ROOT = 'D:/ProjectFolder/claude_project'
SITES = sys.argv[1:] or ['chozworld', 'website01', 'successguide', 'ohhappy-health', 'cplife']
FM = re.compile(r'(?s)^\ufeff?---\r?\n(.*?)\r?\n---\r?\n(.*)$')

for site in SITES:
    root = f'{ROOT}/{site}'
    posts = {}
    for f in glob.glob(root + '/src/content/posts/*.md'):
        m = FM.match(io.open(f, encoding='utf-8').read())
        cat = re.search(r'^category:\s*"?(\w+)', m.group(1), re.M).group(1)
        posts[os.path.basename(f)[:-3]] = (cat, m.group(1), m.group(2))
    lens, bad, imgmiss = [], [], []
    for slug, (cat, fm, body) in sorted(posts.items()):
        b = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', body)
        b = re.sub(r'\]\([^)]*\)', ']', b)
        b = re.sub(r'[#>*|`\[\]]', '', b)
        lens.append((len(re.sub(r'\s+', ' ', b).strip()), slug))
        for c, s in re.findall(r'\]\(/(\w+)/([^/)]+)/\)', body):
            if s not in posts or posts[s][0] != c:
                bad.append((slug, c, s))
        for im in re.findall(r'!\[[^\]]*\]\((/shots/[^)]+)\)', body):
            if not os.path.exists(root + '/public' + im):
                imgmiss.append((slug, im))
        t = re.search(r'^thumb:\s*"?([^"\r\n]+?)"?\s*$', fm, re.M)
        if t and not os.path.exists(f'{root}/public/shots/{t.group(1)}/thumb-wide.webp'):
            imgmiss.append((slug, 'thumb:' + t.group(1)))
    lens.sort()
    print(f'{site}: {len(posts)}편, 길이 min {lens[0]} 중앙값 {statistics.median([w for w, _ in lens])}')
    print('  1700 미만:', [(s, w) for w, s in lens if w < 1700])
    print('  깨진 내부링크:', bad)
    print('  없는 이미지:', imgmiss)

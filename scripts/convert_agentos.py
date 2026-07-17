#!/usr/bin/env python3
"""Converteer de 7 AgentOS content_jobs (IctusGo) naar schone Markdown-artikelen
voor de IctusGo posts-tabel. Leest D:/APPS/agentos/data/agentos.db, schrijft
D:/APPS/IctusGo/scripts/agentos_jobs_clean.json (list van dicts).
"""
import sqlite3, json, re

AGENTOS_DB = 'D:/APPS/agentos/data/agentos.db'
SITE_ID = 'a304b082-741e-4781-9d99-584903b7295c'
OUT = 'D:/APPS/IctusGo/scripts/agentos_jobs_clean.json'

# Vaste, schone slugs voor de 7 jobs (AgentOS-slugs bevatten emoji/em-dashes/parentheses)
SLUG_MAP = {
    'klantcases': 'klantcases-overzichtspagina-ictusgo',
    'maatschappelijk-teamuitje': 'maatschappelijk-teamuitje-7-ideeen',
    'bedrijfsuitje-hoofddorp-schiphol': 'bedrijfsuitje-hoofddorp-schiphol',
    'teambuilding-haarlemmermeer': 'teambuilding-in-haarlemmermeer',
    'teambuilding-hoofddorp': 'teambuilding-in-hoofddorp',
    'checklist-7-succesfactoren': 'checklist-7-succesfactoren-digitale-ketensamenwerking',
    'hoe-ictusgo-wijkteams': 'hoe-ictusgo-wijkteams-ontlast',
}

def extract_html(raw):
    """Haal de echte HTML-tekst uit blog_html (soms embedded JSON)."""
    if not raw:
        return ''
    s = raw.strip()
    # Probeer JSON (SEO-feedback wrapper)
    if s.startswith('{'):
        try:
            obj = json.loads(s)
            for key in ('rewritten_article', 'article', 'html', 'content'):
                if isinstance(obj.get(key), str) and len(obj[key]) > 50:
                    return obj[key].encode().decode('unicode_escape') if '\\n' in obj[key] else obj[key]
        except Exception:
            pass
    return s

def strip_comments(html):
    return re.sub(r'<!--[\s\S]*?-->', '', html)

def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)

def slugify(t, fallback):
    if fallback and fallback in SLUG_MAP:
        return SLUG_MAP[fallback]
    t = (t or '').lower().strip()
    t = re.sub(r'[^\w\s-]', '', t, flags=re.UNICODE)  # verwijder emoji/leestekens
    t = re.sub(r'[\s_-]+', '-', t).strip('-')
    return t[:80]

def html_to_md(html):
    s = html.replace('\n', ' ')
    s = re.sub(r'<(script|style)[\s\S]*?<\/(script|style)>', '', s, flags=re.I)
    s = re.sub(r'<h1[^>]*>([\s\S]*?)<\/h1>', lambda m: f"# {strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = re.sub(r'<h2[^>]*>([\s\S]*?)<\/h2>', lambda m: f"## {strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = re.sub(r'<h3[^>]*>([\s\S]*?)<\/h3>', lambda m: f"### {strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = re.sub(r'<h4[^>]*>([\s\S]*?)<\/h4>', lambda m: f"#### {strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = re.sub(r'<blockquote[^>]*>([\s\S]*?)<\/blockquote>', lambda m: f"\n> {strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = re.sub(r'<ul[^>]*>([\s\S]*?)<\/ul>', lambda m: '\n'.join(
        f"- {strip_tags(li).strip()}" for li in re.findall(r'<li[^>]*>([\s\S]*?)<\/li>', m.group(1), flags=re.I)) + '\n\n', s, flags=re.I)
    s = re.sub(r'<ol[^>]*>([\s\S]*?)<\/ol>', lambda m: '\n'.join(
        f"{i+1}. {strip_tags(li).strip()}" for i, li in enumerate(re.findall(r'<li[^>]*>([\s\S]*?)<\/li>', m.group(1), flags=re.I))) + '\n\n', s, flags=re.I)
    s = re.sub(r'<strong[^>]*>([\s\S]*?)<\/strong>', r'**\1**', s, flags=re.I)
    s = re.sub(r'<b[^>]*>([\s\S]*?)<\/b>', r'**\1**', s, flags=re.I)
    s = re.sub(r'<em[^>]*>([\s\S]*?)<\/em>', r'*\1*', s, flags=re.I)
    s = re.sub(r'<i[^>]*>([\s\S]*?)<\/i>', r'*\1*', s, flags=re.I)
    s = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>', lambda m: f"[{strip_tags(m.group(2)).strip()}]({m.group(1)})", s, flags=re.I)
    s = re.sub(r'<p[^>]*>([\s\S]*?)<\/p>', lambda m: f"{strip_tags(m.group(1)).strip()}\n\n", s, flags=re.I)
    s = strip_tags(s)
    s = re.sub(r'\n{3,}', '\n\n', s).replace(r'[ \t]+\n', '\n').strip()
    return s

def derive_excerpt(md, max=200):
    plain = re.sub(r'[#*_`>()\-[\]()]', ' ', md)
    plain = re.sub(r'\s+', ' ', plain).strip()
    if not plain:
        return ''
    sents = re.findall(r'[^.!?]+[.!?]+', plain) or [plain]
    out = ''
    for sent in sents:
        cand = (out + ' ' + sent).strip()
        if len(cand) > max and out:
            break
        out = cand
    if not out:
        out = plain[:max].rsplit(' ', 1)[0]
    return out

def main():
    c = sqlite3.connect(AGENTOS_DB)
    c.row_factory = sqlite3.Row
    cur = c.cursor()
    cur.execute("SELECT title,slug,keyword,blog_html FROM content_jobs WHERE site_id=?", [SITE_ID])
    rows = cur.fetchall()
    c.close()

    out = []
    for r in rows:
        raw = extract_html(r['blog_html'])
        raw = strip_comments(raw)
        md = html_to_md(raw)
        title = re.sub(r'\s*–\s*Definitieve versie.*$', '', r['title'] or '').strip()
        title = title.replace('&amp;', '&')
        # Bepaal schone slug via substring-match op de originele AgentOS-slug
        orig = (r['slug'] or '').lower()
        slug = None
        for key, val in SLUG_MAP.items():
            if key in orig:
                slug = val
                break
        if not slug:
            slug = slugify(r['slug'], '')
        plain = re.sub(r'[#*_`>()\-[\]()]', ' ', md)
        plain = re.sub(r'\s+', ' ', plain).strip()
        excerpt = derive_excerpt(md)
        reading = max(1, round(len(plain.split()) / 200))
        out.append({
            'slug': slug,
            'title': title,
            'heading': title,
            'category': 'blog',
            'description': excerpt,
            'body': md,
            'excerpt': excerpt,
            'keywords': [r['keyword']] if r['keyword'] else [],
            'cluster': 'teambuilding',
            'reading_time_min': reading,
            'seo_title': title[:60],
            'seo_description': excerpt[:155],
            'source': 'agent-os',
            'status': 'published',
            'cta': 'ictusgo',
        })
        print(f"  {slug[:55]:55} | {len(md)} md chars | {title[:40]}")

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nGeschreven: {OUT} ({len(out)} artikelen)")

if __name__ == '__main__':
    main()

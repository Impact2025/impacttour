#!/usr/bin/env python3
"""Backfill: publiceer de 7 vastzittende AgentOS content-jobs naar IctusGo /api/publish.
Leest rechtstreeks uit AgentOS data/agentos.db, converteert de HTML-body naar het
payload dat /api/publish verwacht, en POST naar de live endpoint met de publish-key.
"""
import sqlite3, json, urllib.request, sys, os

AGENTOS_DB = r"D:/APPS/agentos/data/agentos.db"
SITE_ID = "a304b082-741e-4781-9d99-584903b7295c"
PUBLISH_URL = "https://ictusgo.nl/api/publish"
KEY = open(r"/tmp/ictusgo_publish_key.txt").read().strip()

def clean_text(h):
    import re
    # strip meta comment blocks
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    return h

def main():
    c = sqlite3.connect(AGENTOS_DB); c.row_factory = sqlite3.Row
    rows = c.execute(
        "SELECT id,title,slug,keyword,blog_html,seo_score FROM content_jobs WHERE site_id=?",
        (SITE_ID,)).fetchall()
    print(f"gevonden jobs: {len(rows)}")
    ok = 0
    for r in rows:
        html = clean_text(r['blog_html'] or '')
        # parse meta-title/-description uit html commentaar indien aanwezig
        import re
        mt = re.search(r'Meta-titel:\s*([^\n<]+)', html)
        md = re.search(r'Meta-description:\s*([^\n<]+)', html)
        payload = {
            "title": r['title'],
            "content": html,
            "slug": r['slug'],
            "category": "blog",
            "seoTitle": (mt.group(1).strip() if mt else r['title'])[:60],
            "seoDescription": (md.group(1).strip() if md else ""),
            "keywords": [r['keyword']] if r['keyword'] else [],
            "cluster": "teambuilding",
            "source": "agent-os",
            "cta": "ictusgo",
        }
        req = urllib.request.Request(PUBLISH_URL, data=json.dumps(payload).encode(),
                                     headers={"Authorization": f"Bearer {KEY}",
                                               "Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read().decode()
                j = json.loads(body)
                print(f"[{resp.status}] {r['slug'][:40]:42} -> {j.get('url')} ({j.get('action')})")
                ok += 1
        except urllib.error.HTTPError as e:
            print(f"[HTTP {e.code}] {r['slug'][:40]}: {e.read().decode()[:160]}")
        except Exception as e:
            print(f"[ERR] {r['slug'][:40]}: {str(e)[:160]}")
    print(f"\nOK: {ok}/{len(rows)}")
    return 0 if ok == len(rows) else 1

if __name__ == "__main__":
    sys.exit(main())

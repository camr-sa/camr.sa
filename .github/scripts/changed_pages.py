#!/usr/bin/env python3
"""List built HTML pages that differ from the live site.

Usage: changed_pages.py SITE_DIR BASE_URL
Prints one site-relative path per line (e.g. "ar/privacy/index.html") for every
built page whose bytes differ from the page currently served at BASE_URL, or
that the live site doesn't have yet. Run it before deploying. Standard library only.
"""

import os
import sys
import urllib.error
import urllib.request

SKIP = {"404.html"}


def url_path(rel):
    rel = rel.replace(os.sep, "/")
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def live_bytes(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"Cache-Control": "no-cache"}), timeout=20) as r:
            return r.read()
    except urllib.error.HTTPError:
        return None


def main():
    site_dir, base = sys.argv[1], sys.argv[2].rstrip("/")
    for root, _dirs, files in os.walk(site_dir):
        for name in sorted(files):
            if not name.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(root, name), site_dir).replace(os.sep, "/")
            if rel in SKIP:
                continue
            with open(os.path.join(root, name), "rb") as f:
                built = f.read()
            if live_bytes(base + url_path(rel)) != built:
                print(rel)


if __name__ == "__main__":
    main()

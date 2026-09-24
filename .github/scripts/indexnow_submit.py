#!/usr/bin/env python3
"""Submit changed HTML pages to the IndexNow API.

Uses only the Python standard library. Reads the IndexNow key from the
key file in the repository (public by design), detects changed HTML
files via git, maps them to production URLs, and POSTs them to
https://api.indexnow.org/indexnow.

Exit codes:
  0  submission accepted (HTTP 200/202) or nothing to submit
  1  unexpected IndexNow HTTP response or configuration error
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

API_ENDPOINT = os.environ.get("INDEXNOW_API_ENDPOINT", "https://api.indexnow.org/indexnow")
MAX_URLS_PER_REQUEST = 10000
KEY_LOCATION_TIMEOUT = 10
KEY_LOCATION_WAIT_SECONDS = int(os.environ.get("INDEXNOW_KEY_WAIT_SECONDS", "300"))
KEY_LOCATION_POLL_INTERVAL = 15


def fail(message):
    print("::error::" + message)
    sys.exit(1)


def get_env(name, default=None):
    value = os.environ.get(name, default)
    if value is None:
        fail("Missing required environment variable: " + name)
    return value


def read_key(key_file):
    try:
        with open(key_file, "r", encoding="utf-8") as handle:
            key = handle.read().strip()
    except OSError as error:
        fail("Cannot read IndexNow key file %s: %s" % (key_file, error))
    if len(key) != 32 or any(c not in "0123456789abcdef" for c in key):
        fail("IndexNow key file does not contain a valid 32-char lowercase hex key")
    basename = os.path.basename(key_file)
    if basename != key + ".txt":
        fail("IndexNow key file name (%s) does not match its content key" % basename)
    return key


def git_diff_names(before, after):
    import subprocess

    result = subprocess.run(
        ["git", "diff", "--name-status", "--no-renames", before + ".." + after],
        capture_output=True,
        text=True,
        check=True,
    )
    status_by_path = {}
    for line in result.stdout.splitlines():
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        status, path = parts[0], parts[-1]
        if path in status_by_path and status[0] != "D":
            continue
        status_by_path[path] = status
    return status_by_path


def changed_html_paths(status_by_path):
    html_paths = []
    for path, status in status_by_path.items():
        if status.startswith("D"):
            continue
        if path.endswith(".html") or path.endswith(".htm"):
            html_paths.append(path)
    return html_paths


def is_bootstrap_file(path, key, workflow_file):
    return (
        path == key + ".txt"
        or path == workflow_file
        or path == ".github/scripts/indexnow_submit.py"
        or path.startswith(".github/")
    )


def path_to_url_path(path):
    segments = path.replace("\\", "/").split("/")
    encoded = [urllib.parse.quote(seg, safe="") for seg in segments]
    if encoded[-1] == "index.html" or encoded[-1] == "index.htm":
        encoded.pop()
        if not encoded:
            return "/"
        return "/" + "/".join(encoded) + "/"
    return "/" + "/".join(encoded)


def build_urls(host, paths):
    scheme_host = "https://" + host
    urls = []
    for path in sorted(set(paths)):
        url = scheme_host + path_to_url_path(path)
        if url not in urls:
            urls.append(url)
    return urls


def wait_for_key_file(key_location, key):
    deadline = time.time() + KEY_LOCATION_WAIT_SECONDS
    while time.time() < deadline:
        try:
            request = urllib.request.Request(key_location, method="GET")
            with urllib.request.urlopen(request, timeout=KEY_LOCATION_TIMEOUT) as response:
                body = response.read().decode("utf-8", "replace").strip()
                if response.status == 200 and body == key:
                    print("Key file is live and matches the key: " + key_location)
                    return
        except Exception:
            pass
        print("Waiting for key file to go live: " + key_location)
        time.sleep(KEY_LOCATION_POLL_INTERVAL)
    print(
        "WARNING: key file %s is not reachable yet; submitting anyway "
        "(IndexNow will validate it asynchronously, expect HTTP 202)." % key_location
    )


def submit_chunk(host, key, key_location, urls):
    payload = {
        "host": host,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls,
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        API_ENDPOINT,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            status = response.status
            response_body = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        status = error.code
        response_body = error.read().decode("utf-8", "replace")
    except urllib.error.URLError as error:
        fail("IndexNow request failed to connect: %s" % error.reason)
    print("IndexNow HTTP status: %s" % status)
    if response_body.strip():
        print("IndexNow response body: " + response_body.strip())
    if status not in (200, 202):
        fail("Unexpected IndexNow HTTP status: %s" % status)


def main():
    host = get_env("INDEXNOW_HOST")
    key_file = get_env("INDEXNOW_KEY_FILE")
    event_name = get_env("INDEXNOW_EVENT_NAME")
    sha = get_env("INDEXNOW_SHA")
    before = os.environ.get("INDEXNOW_EVENT_BEFORE", "")
    workflow_file = get_env("INDEXNOW_WORKFLOW_FILE")

    key = read_key(key_file)
    key_location = "https://%s/%s.txt" % (host, key)
    print("IndexNow key location: " + key_location)

    paths = []
    if event_name == "push" and before and before.strip():
        status_by_path = git_diff_names(before.strip(), sha)
        html_paths = changed_html_paths(status_by_path)
        if html_paths:
            paths = html_paths
            print("Changed HTML files: " + ", ".join(sorted(html_paths)))
        else:
            bootstrap = [
                p
                for p in status_by_path
                if is_bootstrap_file(p, key, workflow_file)
                and not status_by_path[p].startswith("D")
            ]
            if bootstrap:
                print(
                    "No HTML changes; bootstrap push detected "
                    "(IndexNow files introduced), submitting homepage."
                )
                paths = ["index.html"]
            else:
                print("No HTML changes detected; nothing to submit.")
                return
    else:
        if event_name != "workflow_dispatch":
            print("Unsupported event '%s'; nothing to submit." % event_name)
            return
        print("Manual dispatch: submitting homepage.")
        paths = ["index.html"]

    urls = build_urls(host, paths)
    print("Submitted %d URL(s):" % len(urls))
    for url in urls:
        print("  " + url)
    for url in urls:
        parsed = urllib.parse.urlparse(url)
        if parsed.netloc != host:
            fail("Refusing to submit URL outside %s: %s" % (host, url))

    wait_for_key_file(key_location, key)

    for start in range(0, len(urls), MAX_URLS_PER_REQUEST):
        chunk = urls[start : start + MAX_URLS_PER_REQUEST]
        submit_chunk(host, key, key_location, chunk)
    print("IndexNow submission complete.")


if __name__ == "__main__":
    main()

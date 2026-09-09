# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
#!/usr/bin/env python3
"""
Turn Claude Code's structured security-scan output into a markdown report
and a SARIF file for GitHub's Security tab.

The actual scanning (deciding which files matter and reading them) is done
by Claude Code itself via the claude-code-action step, using its Grep/Glob/
Read tools -- this script just formats the findings it returns.

Also merges in currently-open GitHub code-scanning alerts for this tool
(fetched separately via `gh api .../code-scanning/alerts`) so that every
run re-emits the full current state. GitHub SARIF uploads are "complete
state per category" -- anything not included in an upload gets auto-closed
as fixed, so already-known alerts must always be carried forward, even
though Claude was told not to spend turns re-finding them. Carried-forward
findings keep their original SARIF rule id so GitHub matches them to the
existing alert instead of creating a duplicate.

Usage:
  python security-scan.py <findings.json> <existing_alerts.json> [out_dir]

<findings.json> is expected to contain either a JSON array of findings, or
an object of the form {"findings": [...]}.

<existing_alerts.json> is the raw JSON array returned by GitHub's list
code-scanning alerts API (may be empty / missing on first run).
"""

import hashlib
import json
import re
import sys
from pathlib import Path

SEV_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}


def load_findings(path: Path):
    if not path.exists():
        print(f"No findings file at {path}, treating as zero findings", file=sys.stderr)
        return []
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Could not parse {path} as JSON: {e}", file=sys.stderr)
        return []
    if isinstance(data, dict):
        data = data.get("findings", [])
    return data if isinstance(data, list) else []


def finding_key(f) -> str:
    basis = f"{f.get('file')}|{f.get('cwe')}|{(f.get('title') or '')[:60]}"
    return hashlib.sha1(basis.encode()).hexdigest()[:12]


def load_existing_alerts(path: Path):
    """Turn GitHub's code-scanning alerts API response back into findings,
    keeping each alert's original SARIF rule id so it can be re-emitted
    unchanged (same rule id + same location = GitHub keeps it as the same
    alert instead of opening a duplicate)."""
    if not path.exists():
        return []
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return []
    try:
        alerts = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Could not parse {path} as JSON: {e}", file=sys.stderr)
        return []
    if not isinstance(alerts, list):
        return []

    out = []
    for a in alerts:
        if not isinstance(a, dict) or a.get("state") != "open":
            continue
        rule = a.get("rule") or {}
        instance = a.get("most_recent_instance") or {}
        location = instance.get("location") or {}
        message = (instance.get("message") or {}).get("text", "") or ""
        explanation, _, fix = message.partition("\n\nFix: ")

        cwe = None
        for tag in rule.get("tags") or []:
            m = re.match(r"external/cwe/cwe-(\d+)", tag)
            if m:
                cwe = f"CWE-{m.group(1)}"
                break

        out.append(
            {
                "ruleId": rule.get("id"),
                "file": location.get("path", ""),
                "line": location.get("start_line"),
                "severity": rule.get("security_severity_level") or "low",
                "cwe": cwe,
                "title": rule.get("description") or rule.get("name") or "(untitled)",
                "explanation": explanation.strip(),
                "fix": fix.strip(),
                "confidence": "medium",
            }
        )
    return out


def dedupe(findings):
    seen, out = {}, []
    for f in findings:
        if not isinstance(f, dict) or "file" not in f:
            continue
        f.setdefault("severity", "low")
        f.setdefault("confidence", "low")
        # Prefer (file, line) so a freshly-worded Claude finding that
        # describes an already-tracked alert doesn't spawn a near-duplicate
        # with a different rule id -- the carried-forward entry wins because
        # it's merged in first (see main()).
        k = (f.get("file"), f.get("line")) if f.get("line") else finding_key(f)
        if k in seen:
            continue
        seen[k] = True
        out.append(f)
    out.sort(
        key=lambda f: (SEV_ORDER.get(f.get("severity", "low"), 9), f.get("file", ""))
    )
    return out


def write_markdown(findings, path: Path):
    lines = ["# Weekly security scan\n", f"Total findings: **{len(findings)}**\n"]
    by_sev = {}
    for f in findings:
        by_sev.setdefault(f["severity"], []).append(f)
    for sev in ["critical", "high", "medium", "low"]:
        group = by_sev.get(sev, [])
        if not group:
            continue
        lines.append(f"\n## {sev.upper()} ({len(group)})\n")
        for f in group:
            loc = f"{f['file']}:{f.get('line') or '?'}"
            lines.append(f"### {f.get('title', '(untitled)')} — `{loc}`")
            lines.append(
                f"- CWE: {f.get('cwe') or 'n/a'} · confidence: {f.get('confidence')}"
            )
            lines.append(f"- {f.get('explanation', '').strip()}")
            lines.append(f"- **Fix:** {f.get('fix', '').strip()}\n")
    path.write_text("\n".join(lines), encoding="utf-8")


LEVEL_BY_SEV = {"critical": "error", "high": "error", "medium": "warning", "low": "note"}
SECURITY_SEVERITY_BY_SEV = {"critical": "9.0", "high": "7.0", "medium": "4.0", "low": "1.0"}


def cwe_tag(cwe):
    if not cwe:
        return None
    num = re.sub(r"\D", "", cwe)
    return f"external/cwe/cwe-{num}" if num else None


def write_sarif(findings, path: Path):
    rules = []
    results = []
    for f in findings:
        rule_id = f.get("ruleId") or finding_key(f)
        severity = f.get("severity", "low")
        title = f.get("title") or "(untitled)"
        explanation = (f.get("explanation") or "").strip()
        fix = (f.get("fix") or "").strip()

        tags = ["security"]
        tag = cwe_tag(f.get("cwe"))
        if tag:
            tags.append(tag)

        rules.append(
            {
                "id": rule_id,
                "name": title,
                "shortDescription": {"text": title},
                "fullDescription": {"text": explanation or title},
                "help": {
                    "text": f"{explanation}\n\nFix: {fix}",
                    "markdown": f"{explanation}\n\n**Fix:** {fix}",
                },
                "defaultConfiguration": {
                    "level": LEVEL_BY_SEV.get(severity, "note")
                },
                "properties": {
                    "tags": tags,
                    "security-severity": SECURITY_SEVERITY_BY_SEV.get(
                        severity, "1.0"
                    ),
                },
            }
        )
        results.append(
            {
                "ruleId": rule_id,
                "level": LEVEL_BY_SEV.get(severity, "note"),
                "message": {"text": f"{explanation}\n\nFix: {fix}"},
                "locations": [
                    {
                        "physicalLocation": {
                            "artifactLocation": {"uri": f.get("file", "")},
                            "region": {"startLine": f.get("line") or 1},
                        }
                    }
                ],
                "properties": {"confidence": f.get("confidence")},
            }
        )
    sarif = {
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "claude-security-scan",
                        "informationUri": "https://www.anthropic.com",
                        "rules": rules,
                    }
                },
                "results": results,
            }
        ],
    }
    path.write_text(json.dumps(sarif, indent=2), encoding="utf-8")


def main():
    if len(sys.argv) < 3:
        print(
            "usage: security-scan.py <findings.json> <existing_alerts.json> [out_dir]",
            file=sys.stderr,
        )
        sys.exit(1)

    findings_path = Path(sys.argv[1])
    existing_alerts_path = Path(sys.argv[2])
    out_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("scan-out")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Existing alerts go first so dedupe() keeps their original rule id
    # when a new finding lands on the same (file, line).
    carried_forward = load_existing_alerts(existing_alerts_path)
    fresh = load_findings(findings_path)
    findings = dedupe(carried_forward + fresh)

    write_markdown(findings, out_dir / "report.md")
    write_sarif(findings, out_dir / "results.sarif")

    counts = {}
    for f in findings:
        counts[f["severity"]] = counts.get(f["severity"], 0) + 1
    print(
        f"Done. {len(findings)} findings ({len(carried_forward)} carried forward, "
        f"{len(fresh)} from this scan): {counts}"
    )


if __name__ == "__main__":
    main()

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

Usage:
  python security-scan.py <findings.json> [out_dir]

<findings.json> is expected to contain either a JSON array of findings, or
an object of the form {"findings": [...]}.
"""

import hashlib
import json
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


def dedupe(findings):
    seen, out = {}, []
    for f in findings:
        if not isinstance(f, dict) or "file" not in f:
            continue
        f.setdefault("severity", "low")
        f.setdefault("confidence", "low")
        k = finding_key(f)
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


def write_sarif(findings, path: Path):
    level = {"critical": "error", "high": "error", "medium": "warning", "low": "note"}
    results = []
    for f in findings:
        results.append(
            {
                "ruleId": f.get("cwe") or "claude-security",
                "level": level.get(f.get("severity", "low"), "note"),
                "message": {
                    "text": f"{f.get('title', '')}: {f.get('explanation', '')} "
                    f"Fix: {f.get('fix', '')}"
                },
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
                        "rules": [],
                    }
                },
                "results": results,
            }
        ],
    }
    path.write_text(json.dumps(sarif, indent=2), encoding="utf-8")


def main():
    if len(sys.argv) < 2:
        print("usage: security-scan.py <findings.json> [out_dir]", file=sys.stderr)
        sys.exit(1)

    findings_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("scan-out")
    out_dir.mkdir(parents=True, exist_ok=True)

    findings = dedupe(load_findings(findings_path))
    write_markdown(findings, out_dir / "report.md")
    write_sarif(findings, out_dir / "results.sarif")

    counts = {}
    for f in findings:
        counts[f["severity"]] = counts.get(f["severity"], 0) + 1
    print(f"Done. {len(findings)} findings: {counts}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Filters regression_tests.json (the pre-parsed export of the regression
workbook) by test_suite and, optionally, section — writing just the matching
rows to a file. The full file is ~600KB / ~190 rows; always filter through
this script rather than reading it whole with the Read tool.

Usage:
  # List every (test_suite, section) pair present, in file order
  python3 filter_regression.py "<path-to-regression_tests.json>" --list

  # Write every row for a suite
  python3 filter_regression.py "<path-to-regression_tests.json>" "<Test Suite>" out.json

  # Write only the rows for one section within a suite
  python3 filter_regression.py "<path-to-regression_tests.json>" "<Test Suite>" out.json --section "<Section>"

Matching on test_suite/section is case-insensitive and exact (not
substring) — run --list first if unsure of exact spelling/casing.

Each row already has `steps`/`expected_results` arrays split out. When a
row's `aligned` field is false, those two arrays don't line up 1:1 (the
source spreadsheet numbered them inconsistently) — for those rows, read
`raw_steps`/`raw_expected_result` as prose instead of zipping the arrays.
This script flags which written rows are unaligned so you don't miss it.
"""
import sys
import json


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    path = args[0]
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    if '--list' in args:
        seen = []
        for row in data:
            key = (row['test_suite'], row['section'])
            if key not in seen:
                seen.append(key)
        for suite, section in seen:
            print(f"{suite} -> {section}")
        return

    suite, out_path = args[1], args[2]
    section = None
    if '--section' in args:
        section = args[args.index('--section') + 1]

    matches = [
        row for row in data
        if row['test_suite'].strip().lower() == suite.strip().lower()
        and (section is None or row['section'].strip().lower() == section.strip().lower())
    ]

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)

    unaligned = [row['id'] for row in matches if not row.get('aligned', True)]
    print(f"{len(matches)} matching rows written to {out_path}")
    if unaligned:
        print(
            f"WARNING: {len(unaligned)} row(s) have aligned=false: {', '.join(unaligned)}"
        )
        print(
            "For these, read raw_steps/raw_expected_result as prose instead of "
            "zipping steps[]/expected_results[]."
        )
    if not matches:
        print("No matches — re-run with --list to check exact suite/section spelling.")


if __name__ == '__main__':
    main()

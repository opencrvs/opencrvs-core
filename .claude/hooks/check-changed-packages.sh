#!/usr/bin/env bash
# Runs `test:compilation` and `lint` once per package touched during the
# session, in place of running them after every single file edit.
set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" || exit 0

changed_files=$(
  { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u
)

changed_packages=$(
  echo "$changed_files" |
    grep '^packages/' |
    sed -E 's|^packages/([^/]+)/.*|\1|' |
    sort -u
)

for package in $changed_packages; do
  package_dir="packages/$package"
  package_json="$package_dir/package.json"
  [ -f "$package_json" ] || continue

  package_name=$(node -p "require('./$package_json').name" 2>/dev/null) || continue

  # nx run (not `pnpm run`) so cross-package deps (e.g. commons) are built/checked first, with caching.
  if grep -q '"test:compilation"' "$package_json"; then
    nx run "$package_name:test:compilation"
  fi

  if grep -q '"lint"' "$package_json"; then
    nx run "$package_name:lint"
  fi
done

exit 0

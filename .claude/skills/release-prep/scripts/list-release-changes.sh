#!/usr/bin/env bash
# Collects what changed in an OpenCRVS core release so release-prep skills
# reason over the same facts every run.
#
# Usage: list-release-changes.sh <version> [--base <ref>] [--head <ref>] [--out <dir>]
#   <version>  e.g. 2.1 or 2.1.0
#   --base     defaults to the previous minor's .0 tag (2.1 -> v2.0.0)
#   --head     defaults to origin/release/<version>.0 if it exists, else origin/develop
#   --out      defaults to a fresh temp dir
#
# Writes into --out:
#   changelog.md        the CHANGELOG.md section for <version>
#   commits.txt         first-parent commits in the range, one line each (PR number + title)
#   packages.txt        files changed per package, sorted by volume
#   signals/<topic>.txt changed files grouped by docs-relevant topic
#   new-packages.txt    packages that did not exist at the base
#   env-vars.txt        env var names added/removed in environment.ts, compose files and Helm values
#                       (new packages excluded: all their vars are new by definition)
# and prints a short summary with those paths.

set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ] || [[ "$VERSION" == --* ]]; then
  echo "Usage: $0 <version> [--base <ref>] [--head <ref>] [--out <dir>]" >&2
  exit 1
fi
shift

BASE=""
HEAD=""
OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --head) HEAD="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

MAJOR="${VERSION%%.*}"
REST="${VERSION#*.}"
MINOR="${REST%%.*}"
FULL="$MAJOR.$MINOR.0"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

git fetch --quiet --tags origin 2>/dev/null || echo "warning: git fetch failed, using local refs" >&2

if [ -z "$BASE" ]; then
  if [ "$MINOR" -gt 0 ]; then
    BASE="v$MAJOR.$((MINOR - 1)).0"
  else
    BASE="$(git tag --list "v$((MAJOR - 1)).*.0" --sort=-v:refname | head -1)"
  fi
fi

if [ -z "$HEAD" ]; then
  if git rev-parse --verify --quiet "origin/release/$FULL" >/dev/null; then
    HEAD="origin/release/$FULL"
  else
    HEAD="origin/develop"
  fi
fi

git rev-parse --verify --quiet "$BASE" >/dev/null || { echo "Base ref not found: $BASE" >&2; exit 1; }
git rev-parse --verify --quiet "$HEAD" >/dev/null || { echo "Head ref not found: $HEAD" >&2; exit 1; }

FORK="$(git merge-base "$BASE" "$HEAD")"
OUT="${OUT:-$(mktemp -d -t "release-$FULL")}"
mkdir -p "$OUT/signals"

# --- CHANGELOG section (read from HEAD, not the working tree) ---
git show "$HEAD:CHANGELOG.md" |
  awk -v v="$MAJOR.$MINOR." '
    /^## / { if (found) done = 1; else if (index($0, "## " v) == 1) found = 1 }
    found && !done { print }
  ' >"$OUT/changelog.md"

# --- Commits: "<sha> #<pr> <title>" ---
# Merge commits carry the PR title on the first body line; squash commits carry "(#NNNN)" in the subject.
git log --first-parent --format='%h%x1f%s%x1f%b%x1e' "$FORK..$HEAD" |
  awk 'BEGIN { RS = "\x1e"; FS = "\x1f" }
    NF >= 2 {
      sha = $1; gsub(/^[[:space:]]+/, "", sha)
      subj = $2; body = $3
      pr = ""
      if (match(subj, /^Merge pull request #[0-9]+/)) {
        pr = substr(subj, 20, RLENGTH - 19)
        split(body, lines, "\n")
        title = ""
        for (i = 1; i in lines; i++) if (lines[i] != "") { title = lines[i]; break }
        if (title == "") title = subj
      } else if (match(subj, /\(#[0-9]+\)$/)) {
        pr = substr(subj, RSTART + 1, RLENGTH - 2)
        title = substr(subj, 1, RSTART - 2)
      } else {
        title = subj
      }
      if (subj ~ /^Merge (branch|remote-tracking branch) /) next
      printf "%s %s %s\n", sha, (pr == "" ? "-" : pr), title
    }' >"$OUT/commits.txt"

# --- Per-package change volume ---
git diff --name-only "$FORK" "$HEAD" >"$OUT/.files"
awk -F/ '
  $1 == "packages" { print "packages/" $2; next }
  { print $1 }
' "$OUT/.files" | sort | uniq -c | sort -rn >"$OUT/packages.txt"

# --- Docs-relevant signals: topic <tab> extended regex over changed paths ---
while IFS=$'\t' read -r topic pattern; do
  [ -z "$topic" ] && continue
  grep -E "$pattern" "$OUT/.files" | grep -vE '\.test\.tsx?$|__snapshots__|/fixtures?/' >"$OUT/signals/$topic.txt" || true
  [ -s "$OUT/signals/$topic.txt" ] || rm "$OUT/signals/$topic.txt"
done <<'EOF'
env-and-deploy	(^|/)(environment|constants)\.ts$|docker-compose[^/]*\.ya?ml$|^charts/|(^|/)\.env|/infrastructure/
scopes-and-roles	^packages/commons/src/(scopes|roles|authentication)[^/]*\.ts$|^packages/auth/
event-config	^packages/commons/src/(events|event-config|field-config|conditionals)/
toolkit-api	^packages/toolkit/
events-api	^packages/events/src/router/|^packages/api-docs/
countryconfig-contract	^packages/countryconfig-template/|^packages/commons/src/countryconfig/
integrations	^packages/(mosip|mosip-api|webhooks|gateway)/|/integration
search-and-workqueues	^packages/commons/src/(search|searchConfigs)|^packages/events/src/service/(indexing|search)|workqueue
certificates	certificate
locations	location|administrative-area
migrations	^packages/migration/|/migrations?/
EOF

# --- Packages that did not exist at the fork point (e.g. moved in from another repo) ---
comm -13 <(git ls-tree --name-only "$FORK" packages/ | sort) <(git ls-tree --name-only "$HEAD" packages/ | sort) >"$OUT/new-packages.txt"

# --- Env var names added/removed in pre-existing packages' envalid files, compose files and Helm values ---
EXCLUDES=()
while read -r pkg; do EXCLUDES+=(":(exclude)$pkg"); done <"$OUT/new-packages.txt"
git diff "$FORK" "$HEAD" -- '*environment.ts' '*docker-compose*.yml' 'charts/**/values*.yaml' ${EXCLUDES[@]+"${EXCLUDES[@]}"} |
  grep -E '^[+-][[:space:]]+-?[[:space:]]*[A-Z][A-Z0-9_]{2,}[[:space:]]*[:=]' |
  sed -E 's/^([+-])[[:space:]]+-?[[:space:]]*([A-Z][A-Z0-9_]+).*/\1 \2/' |
  sort -u |
  # A name on both sides was only edited; keep names that appear or disappear entirely
  awk '{ seen[$2] = seen[$2] $1 } END { for (n in seen) if (seen[n] == "+") print "added   " n; else if (seen[n] == "-") print "removed " n }' |
  sort >"$OUT/env-vars.txt" || true

rm -f "$OUT/.files"

echo "Release $FULL"
echo "  range:     $BASE ($FORK) .. $HEAD ($(git rev-parse --short "$HEAD"))"
echo "  changelog: $OUT/changelog.md ($(wc -l <"$OUT/changelog.md" | tr -d ' ') lines)"
echo "  commits:   $OUT/commits.txt ($(wc -l <"$OUT/commits.txt" | tr -d ' ') first-parent commits)"
echo "  packages:  $OUT/packages.txt (new since base: $(tr '\n' ' ' <"$OUT/new-packages.txt"))"
echo "  env vars:  $OUT/env-vars.txt ($(wc -l <"$OUT/env-vars.txt" | tr -d ' ') added/removed)"
echo "  signals:"
for f in "$OUT"/signals/*.txt; do
  [ -e "$f" ] || continue
  printf '    %-24s %4s files  %s\n' "$(basename "$f" .txt)" "$(wc -l <"$f" | tr -d ' ')" "$f"
done
if [ ! -s "$OUT/changelog.md" ]; then
  echo "warning: no '## $MAJOR.$MINOR.x' section found in CHANGELOG.md at $HEAD" >&2
fi

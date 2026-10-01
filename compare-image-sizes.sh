#!/usr/bin/env bash

set -euo pipefail

VERSION_1="${1:-v2.0.0}"
VERSION_2="${2:-v2.1.0}"

PLATFORM="linux/amd64"

# See packages in https://github.com/orgs/opencrvs/packages?repo_name=opencrvs-core
PACKAGES=(
  ocrvs-base
  ocrvs-events
  ocrvs-auth
  ocrvs-client
  ocrvs-login
  ocrvs-migration
  ocrvs-data-seeder
  ocrvs-documents
  ocrvs-gateway
)

format_size() {
  awk -v size="$1" 'BEGIN {
    sign = ""

    if (size < 0) {
      sign = "-"
      size = -size
    }

    if (size >= 1073741824)
      printf "%s%.1fG", sign, size / 1073741824
    else if (size >= 1048576)
      printf "%s%.1fM", sign, size / 1048576
    else if (size >= 1024)
      printf "%s%.1fK", sign, size / 1024
    else
      printf "%s%dB", sign, size
  }'
}

get_size() {
  local image="$1"
  local version="$2"

  crane manifest \
    --platform "$PLATFORM" \
    "$image:$version" \
    | jq '[.layers[].size] | add'
}

echo "Comparing OpenCRVS package sizes"
echo "  $VERSION_1 vs $VERSION_2"
echo "  Platform: $PLATFORM"
echo

printf "%-20s %12s %12s %12s %10s\n" \
  "Package" "$VERSION_1" "$VERSION_2" "Difference" "Change"

printf "%-20s %12s %12s %12s %10s\n" \
  "-------" "---------" "---------" "----------" "------"

for package in "${PACKAGES[@]}"; do
  image="ghcr.io/opencrvs/$package"

  echo -n "" >&2

  if ! size_1=$(get_size "$image" "$VERSION_1" 2>/dev/null); then
    printf "%-20s %12s %12s %12s %10s\n" \
      "$package" "ERROR" "-" "-" "-"
    continue
  fi

  if ! size_2=$(get_size "$image" "$VERSION_2" 2>/dev/null); then
    printf "%-20s %12s %12s %12s %10s\n" \
      "$package" "$(format_size "$size_1")" "ERROR" "-" "-"
    continue
  fi

  diff=$((size_2 - size_1))

  percentage=$(awk -v old="$size_1" -v new="$size_2" 'BEGIN {
    if (old == 0)
      print "N/A"
    else
      printf "%+.1f%%", ((new - old) / old) * 100
  }')

  printf "%-20s %12s %12s %12s %10s\n" \
    "$package" \
    "$(format_size "$size_1")" \
    "$(format_size "$size_2")" \
    "$(format_size "$diff")" \
    "$percentage"
done

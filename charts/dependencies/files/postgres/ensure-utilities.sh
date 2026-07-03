#!/usr/bin/env bash

# Ensure commands are available, installing their packages only when required.
# Usage: ensure_utilities "<packages>" <command>...
ensure_utilities() {
  local packages="$1"
  shift

  local missing=""
  local utility
  for utility in "$@"; do
    command -v "$utility" >/dev/null 2>&1 || missing="$missing $utility"
  done

  if [ -z "$missing" ]; then
    return 0
  fi

  # Package names are passed as a trusted, space-separated list by chart scripts.
  if ! apt-get update || ! apt-get install -y $packages; then
    echo "[ERROR] Missing utilities:$missing" >&2
    echo "[ERROR] Automatic installation failed. Ensure the container can access its package repositories, or include the required packages in the base image for air-gapped deployments." >&2
    return 1
  fi

}

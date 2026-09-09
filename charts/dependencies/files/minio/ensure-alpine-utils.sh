#!/usr/bin/env bash

ensure_alpine_utils() {
  local missing=""
  local utility
  for utility in bash curl openssl ssh jq rsync mcli; do
    command -v "$utility" >/dev/null 2>&1 || missing="$missing $utility"
  done
  date -d yesterday >/dev/null 2>&1 || missing="$missing GNU-date"

  if [ -z "$missing" ]; then
    return 0
  fi

  if ! apk add --no-cache bash curl openssl openssh jq rsync minio-client coreutils; then
    echo "[ERROR] Missing utilities:$missing" >&2
    echo "[ERROR] Automatic installation failed. Ensure the container can access its package repositories, or include the required packages in the base image for air-gapped deployments." >&2
    return 1
  fi
}

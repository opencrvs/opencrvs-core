# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# ---------------------------------------------------------------------------
# THE ENVIRONMENT CONTRACT, FOR SHELL SCRIPTS
#
# Every local environment (see docs/adr/0003-multiple-local-environments.md)
# owns its own database, Elasticsearch indices, MinIO bucket, Redis DB and port
# block. `packages/dev-cli` derives all of that from the enclosing git worktree
# and prints it as `export VAR='value'` lines. This file is the one supported
# way for a repo script to get those variables into its own shell, so that no
# script ever hardcodes `events` / `ocrvs` / port 5555 again — and so that no
# script derives them a second time, differently.
#
# Usage, from any script in this repository:
#
#     REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
#     source "$REPO_ROOT/development-environment/environment.sh"
#     opencrvs_env_load "$@"      # honours --env <name> / --env=<name>
#
# After that, the whole contract is exported: TARGET_DB, ES_INDEX_PREFIX,
# ES_REINDEXING_STATUS_INDEX, MINIO_BUCKET, REDIS_DB, every *_PORT and every
# *_URL. `packages/dev-cli/src/env-contract.ts` is the full list.
#
# Two rules make this safe:
#
# 1. `opencrvs_env_load` is **read-only**: it calls dev-cli's `lookup`, which
#    never allocates a slot and never writes the registry. Only `pnpm dev`
#    creates an environment, via `opencrvs_env_export_contract resolve`. A
#    script that clears or seeds data must not be the thing that brings an
#    environment into existence.
#
# 2. A contract already present in the environment is inherited rather than
#    re-derived, unless `--env` is given. This matters because `--env` cannot be
#    recovered after the fact: the primary worktree's own directory name means
#    the *default* environment when derived from the directory, and a *separate*
#    environment when passed as `--env`. Inheriting is also what makes
#    `pnpm reindex` correct when another script (or `pnpm dev`) already loaded
#    an environment and exported it to its children.
# ---------------------------------------------------------------------------

# The `--env <name>` value, empty when the environment is derived from the
# worktree directory. Read by `opencrvs_env_cli` so every dev-cli call this
# script makes targets the same environment.
OPENCRVS_ENV_ARG="${OPENCRVS_ENV_ARG:-}"

# Parse a script's arguments. `--env <name>` and `--env=<name>` are the only
# ones understood; anything else is an error rather than a silently ignored
# token, because acting on the wrong environment destroys data.
opencrvs_env_parse_args() {
  OPENCRVS_ENV_ARG=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --env)
        shift
        if [ $# -eq 0 ]; then
          echo "Option --env needs a value, for example: --env my-branch" >&2
          return 1
        fi
        OPENCRVS_ENV_ARG="$1"
        ;;
      --env=*)
        OPENCRVS_ENV_ARG="${1#--env=}"
        ;;
      *)
        echo "Unknown option: $1" >&2
        return 1
        ;;
    esac
    shift
  done
}

# Run one of `packages/dev-cli`'s package scripts against this environment,
# forwarding `--env` when the caller gave one. Every dev-cli call from a shell
# script should go through here, so none of them can disagree about which
# environment is being acted on.
opencrvs_env_cli() {
  local script="$1"
  shift

  local args=()
  if [ -n "${OPENCRVS_ENV_ARG:-}" ]; then
    args=(--env "$OPENCRVS_ENV_ARG")
  fi

  pnpm --filter @opencrvs/dev-cli --silent "$script" \
    ${args[@]+"${args[@]}"} "$@"
}

# Export this environment's contract into the current shell.
#
# $1 is the dev-cli package script to use: `env:lookup` (read-only, the default
# for every script) or `resolve` (allocates a slot and registers the use, only
# for `pnpm dev`).
#
# The command substitution is assigned first and evaluated second on purpose:
# `eval "$(...)"` would discard the exit code and silently export nothing.
# Warnings go to stderr, so the stdout being evaluated is only export lines.
opencrvs_env_export_contract() {
  local script="${1:-env:lookup}"
  local contract

  if ! contract=$(opencrvs_env_cli "$script"); then
    echo >&2
    echo "Failed to resolve this worktree's OpenCRVS environment." >&2
    return 1
  fi

  eval "$contract"
}

# The entry point for ordinary scripts: parse `--env`, then make sure the
# contract is loaded. Inherits an already-exported contract when no `--env` was
# given (see rule 2 above).
opencrvs_env_load() {
  opencrvs_env_parse_args "$@" || return 1

  if [ -z "${OPENCRVS_ENV_ARG:-}" ] &&
    [ -n "${OPENCRVS_ENV_NAME:-}" ] &&
    [ -n "${OPENCRVS_ENV_SLOT:-}" ]; then
    return 0
  fi

  opencrvs_env_export_contract env:lookup
}

# One line naming what any destructive command is about to act on. Printing the
# derived identifiers, rather than the environment name alone, is what lets a
# developer stop before clearing the wrong environment.
opencrvs_env_describe() {
  echo "environment    ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT})"
  echo "database       ${TARGET_DB}"
  echo "index prefix   ${ES_INDEX_PREFIX}"
  echo "bucket         ${MINIO_BUCKET}"
}

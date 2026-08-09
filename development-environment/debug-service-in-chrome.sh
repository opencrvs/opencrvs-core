#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -euo pipefail

# ANSI color codes
ROYAL_BLUE="\033[38;5;21m"
RESET="\033[0m"
PURPLE="\033[35m"
YELLOW="\033[33m"
UNDERLINE="\033[4m"
RED="\033[31m"
GREEN="\033[32m"

print_usage_and_exit () {
  echo 'Usage: pnpm debug <service> [--env <name>]'
  echo
  echo "Opens Node's inspector on ONE environment's service and points Chrome"
  echo "DevTools at it. With no --env, that is the environment this git"
  echo "worktree owns. Run 'pnpm env:list' to see which environments exist."
  echo
  echo "Services: auth, events, gateway, countryconfig, documents"
  exit 1
}

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# --------------------------------------------------------------------------
# Arguments
#
# The service name is this script's own argument; everything else is handed to
# `opencrvs_env_load`, which owns `--env` (and rejects anything it does not
# know). Attaching a debugger to the wrong environment is silent — it looks
# like your breakpoints simply never fire — so an unrecognised token is an
# error here too, never an ignored one.
# --------------------------------------------------------------------------
SERVICE_NAME=""
ENV_ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --env)
      ENV_ARGS+=("$1")
      shift
      if [ $# -eq 0 ]; then
        echo "Option --env needs a value, for example: --env my-branch" >&2
        print_usage_and_exit
      fi
      ENV_ARGS+=("$1")
      ;;
    --env=*)
      ENV_ARGS+=("$1")
      ;;
    -*)
      echo "Unknown option: $1" >&2
      print_usage_and_exit
      ;;
    *)
      if [ -n "$SERVICE_NAME" ]; then
        echo "Only one service can be debugged at a time." >&2
        print_usage_and_exit
      fi
      SERVICE_NAME="$1"
      ;;
  esac
  shift
done

if [ -z "$SERVICE_NAME" ]; then
  echo -e "${RED}No service given.${RESET}" >&2
  print_usage_and_exit
fi

# Which environment's processes to signal. `packages/dev-cli` owns the port
# arithmetic; this script only reads the resulting ports out of the contract,
# so it can never signal the primary environment's process from a linked
# worktree. See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load ${ENV_ARGS[@]+"${ENV_ARGS[@]}"} || print_usage_and_exit

# Service names match the rest of the repository (`documents`, not
# `document`). Ports come from the contract, never from a literal.
SERVICES=(
  "auth:${AUTH_PORT}"
  "events:${EVENTS_PORT}"
  "gateway:${GATEWAY_PORT}"
  "countryconfig:${COUNTRY_CONFIG_PORT}"
  "documents:${DOCUMENTS_PORT}"
)

# Node opens its inspector on this fixed port when it receives SIGUSR1; it is
# not derived from anything in the environment contract and deliberately not
# made per-environment. See docs/adr/0003-multiple-local-environments.md.
INSPECTOR_HOST_PORT="localhost:9229"
INSPECTOR_URL="chrome://inspect/#devices"

get_port() {
  local service_name=$1
  local service name port
  for service in "${SERVICES[@]}"; do
    IFS=":" read -r name port <<< "$service"
    if [ "$name" == "$service_name" ]; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

display_supported_services() {
  local service name port
  echo -e "${YELLOW}Supported services in environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT}):${RESET}"
  for service in "${SERVICES[@]}"; do
    IFS=":" read -r name port <<< "$service"
    echo -e "${ROYAL_BLUE}- $name: $port${RESET}"
  done
}

# Open the inspector UI, degrading through everything this machine might have.
# The last resort is printing the URL: the signal has already been delivered at
# this point, so a developer who pastes it themselves gets the same session.
open_inspector() {
  local browser

  if [ "$(uname -s)" == "Darwin" ] && command -v open >/dev/null 2>&1; then
    if open -a "Google Chrome" "$INSPECTOR_URL" >/dev/null 2>&1; then
      return 0
    fi
  fi

  # `xdg-open` hands chrome:// URLs to whatever the desktop's default browser
  # is, which may not be Chromium-based, so a known binary is tried first.
  for browser in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$browser" >/dev/null 2>&1; then
      "$browser" "$INSPECTOR_URL" >/dev/null 2>&1 &
      return 0
    fi
  done

  if command -v xdg-open >/dev/null 2>&1; then
    if xdg-open "$INSPECTOR_URL" >/dev/null 2>&1; then
      return 0
    fi
  fi

  return 1
}

PORT=$(get_port "$SERVICE_NAME" || true)

if [ -z "$PORT" ]; then
  echo -e "${RED}No port found for service name '$SERVICE_NAME'.${RESET}" >&2
  display_supported_services
  exit 1
fi

# Only the listening socket, so a client of the service in another environment
# is never mistaken for the service itself.
PID=$(lsof -t -i "tcp:${PORT}" -sTCP:LISTEN || true)

if [ -z "$PID" ]; then
  echo -e "${RED}No process is listening on port $PORT for service '$SERVICE_NAME' in environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT}).${RESET}" >&2
  echo -e "${RED}Start it with 'pnpm dev' in this worktree, or pass --env <name> to debug another environment.${RESET}" >&2
  display_supported_services
  exit 1
fi

# shellcheck disable=SC2086 # lsof can print more than one PID, one per line.
kill -s USR1 $PID
echo -e "${GREEN}Sent SIGUSR1 to PID $(echo $PID | tr '\n' ' ')for service '$SERVICE_NAME' on port $PORT.${RESET}"
echo -e "${GREEN}Environment: ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT}).${RESET}"

if ! open_inspector; then
  echo -e "${YELLOW}Could not open a browser on this machine. Open this URL in Chrome yourself:${RESET}"
  echo -e "${PURPLE}${UNDERLINE}$INSPECTOR_URL${RESET}"
fi

echo -e "${PURPLE}====================================================${RESET}"
echo -e "${YELLOW}This script helps you debug the '$SERVICE_NAME' service of environment ${OPENCRVS_ENV_NAME}, running on http://localhost:$PORT, in Google Chrome DevTools.${RESET}"
echo -e "${PURPLE}====================================================${RESET}"
echo -e "${ROYAL_BLUE}1. Once the DevTools are open, click 'inspect' below the 'Remote Target' link.${RESET}"
echo -e "${ROYAL_BLUE}2. A new window will pop up.${RESET}"
echo -e "${ROYAL_BLUE}3. Go to the 'Sources' tab.${RESET}"
echo -e "${ROYAL_BLUE}4. Press \033[35mCtrl/Command + P${ROYAL_BLUE} and type the filename to select the file.${RESET}"
echo -e "${ROYAL_BLUE}5. Add breakpoints and debug your Node.js application.${RESET}"
echo -e "${ROYAL_BLUE}6. If you don't see your service listed as a remote target, click on 'Configure', check if '$INSPECTOR_HOST_PORT' exists. If not, add it, then run the script again.${RESET}"
echo -e "${ROYAL_BLUE}For more details on debugging Node.js applications, click here: ${PURPLE}\033[4mhttps://nodejs.org/en/learn/getting-started/debugging${RESET}${ROYAL_BLUE}.${RESET}"
echo -e "${PURPLE}====================================================${RESET}"
echo -e "${RED}Note: only ONE environment can be attached at a time. SIGUSR1 always opens Node's inspector on $INSPECTOR_HOST_PORT, which is not per-environment, so if a service in another environment is already attached, this one logs 'address already in use' and chrome://inspect keeps showing the first. Stop the other environment's service, or the debugged process, before debugging here.${RESET}"
echo -e "${RED}Note: if a previously debugged service of this environment is still showing up as the remote target, stop that service and refresh Chrome DevTools.${RESET}"

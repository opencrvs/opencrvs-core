#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e
DIR=$(cd "$(dirname "$0")"; pwd)

# Everything below assumes the repository root: the docker compose `-f` paths in
# the root package.json are relative to it, and `resolve` derives this
# environment's identity from the enclosing git worktree.
cd "$DIR/.."

export LANGUAGES="en,fr"

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  OS="UBUNTU"
  else
  OS="MAC"
fi

if [ ! $OS == "UBUNTU" ]; then
  export LOCAL_IP=host-gateway
fi

####
#
# SUPER USER MODE
# --only-dependencies / --only-services start only the dependencies or services,
# so more experienced users can run the stack across different terminal windows.
# --no-testland excludes the bundled testland countryconfig from the dev sweep,
# for devs running against an external countryconfig checkout (two-terminal, unchanged).
# --env <name> pins this environment's identity instead of deriving it from the
# worktree directory name, so a stable name (and therefore a stable slot, port
# block and database) survives renaming or recreating the directory.
#
###
dependencies=false
services=false
environmentName=""

while [ $# -gt 0 ]
do
  case $1 in
    --only-dependencies)
      dependencies=true
      ;;
    --only-services)
      services=true
      ;;
    --no-testland)
      export OTHER_LERNA_FLAGS="--ignore @opencrvs/testland"
      ;;
    --env)
      shift
      if [ $# -eq 0 ]; then
        echo "Option --env needs a value, for example: pnpm dev --env my-branch"
        exit 1
      fi
      environmentName="$1"
      ;;
    --env=*)
      environmentName="${1#--env=}"
      ;;
    *)
      # Handle unknown option
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

####
#
# SHARED DEPENDENCIES
# Postgres, Elasticsearch, Redis and MinIO run as one machine-wide singleton
# under the docker compose project `opencrvs-deps`, shared by every local
# environment. Starting them is idempotent and no environment ever stops them —
# teardown is explicit (`pnpm compose:down:deps`).
# See docs/adr/0003-multiple-local-environments.md.
#
###
function start_dependencies() {
  echo
  echo -e "\033[32m:::::::::: STARTING SHARED DEPENDENCIES ::::::::::\033[0m"
  echo
  echo "The dependencies are a machine-wide singleton shared by every OpenCRVS environment."
  echo "They run detached and are left running when this session ends."
  echo
  pnpm run compose:deps:detached
}

# None of the dependency compose services declares a healthcheck, so readiness
# is probed explicitly rather than slept through. Postgres is probed over TCP
# from inside the container, because the entrypoint's initdb phase listens on
# the unix socket only — a socket probe would report ready too early.
function postgres_ready() {
  docker exec "${POSTGRES_CONTAINER:-opencrvs-deps-postgres-1}" \
    pg_isready -h 127.0.0.1 -p 5432 -U postgres -q
}

function redis_ready() {
  docker exec "${REDIS_CONTAINER:-opencrvs-deps-redis-1}" redis-cli ping | grep -q PONG
}

function elasticsearch_ready() {
  curl -fsS "http://localhost:9200/_cluster/health"
}

function minio_ready() {
  curl -fsS "http://localhost:3535/minio/health/live"
}

function wait_for() {
  local label=$1
  local probe=$2
  local timeout=${DEPS_READY_TIMEOUT_SECONDS:-180}
  local waited=0

  printf "Waiting for %s " "$label"

  until $probe >/dev/null 2>&1; do
    if [ "$waited" -ge "$timeout" ]; then
      echo
      echo "Timed out after ${timeout}s waiting for $label to become ready."
      echo "Inspect the shared dependencies with:"
      echo "docker compose -p opencrvs-deps -f docker-compose.deps.yml -f docker-compose.dev-deps.yml ps"
      exit 1
    fi
    printf "."
    sleep 2
    waited=$((waited + 2))
  done

  echo -e " \033[32mready\033[0m"
}

function wait_for_dependencies() {
  echo
  echo -e "\033[32m:::::::::: WAITING FOR SHARED DEPENDENCIES ::::::::::\033[0m"
  echo
  wait_for "Postgres" postgres_ready
  wait_for "Redis" redis_ready
  wait_for "Elasticsearch" elasticsearch_ready
  wait_for "MinIO" minio_ready
}

####
#
# THIS ENVIRONMENT
#
###

# JWT signing keys are shared machine-wide, so they are generated once and then
# left alone. Regenerating them on every run would break any other environment
# already running on this machine as soon as one of its services reloads.
function ensure_secrets() {
  mkdir -p .secrets

  if [ ! -f .secrets/private-key.pem ] || [ ! -f .secrets/public-key.pem ]; then
    pnpm dev:secrets:gen
  fi
}

# `resolve` prints this environment's whole contract as `export VAR='value'`
# lines on stdout (warnings go to stderr), so it is safe to eval. Sourcing it is
# shared with every other script that needs the contract — see
# development-environment/environment.sh.
#
# `pnpm dev` is the only caller that uses `resolve` rather than the read-only
# `env:lookup`: it is the command that brings an environment into existence, so
# it is the one allowed to allocate a slot and register the use.
source "$DIR/environment.sh"

function resolve_environment() {
  OPENCRVS_ENV_ARG="$environmentName"
  opencrvs_env_export_contract resolve || exit 1
}

function print_environment() {
  echo
  echo -e "\033[32m:::::::::: THIS ENVIRONMENT ::::::::::\033[0m"
  echo
  echo "  name             $OPENCRVS_ENV_NAME (slot $OPENCRVS_ENV_SLOT)"
  echo "  database         $TARGET_DB"
  echo "  search prefix    $ES_INDEX_PREFIX"
  echo "  document bucket  $MINIO_BUCKET"
  echo "  redis database   $REDIS_DB"
  echo -e "  client           \033[32mhttp://localhost:$CLIENT_PORT\033[0m"
  echo "  login            http://localhost:$LOGIN_PORT"
  echo "  gateway          $GATEWAY_URL"
  echo "  country config   $COUNTRY_CONFIG_URL"
  echo
}

# Idempotent: creates the database, its schemas and the shared roles if they are
# missing, then runs migrations. Re-running it on an existing environment is a
# no-op, so every `pnpm dev` can go through it.
function provision_environment() {
  echo
  echo -e "\033[32m:::::::::: PROVISIONING DATABASE $TARGET_DB ::::::::::\033[0m"
  echo
  pnpm --filter @opencrvs/migration provision --db "$TARGET_DB"
}

# The dependency singleton keeps its data in docker named volumes, so no bind
# mount directory is needed for it. mosip-api is the one service that still
# writes to the checkout: it keeps its record-only tokens in SQLite, one file
# per environment, and better-sqlite3 will not create the directory itself.
#
# Runs after `resolve_environment`, because the path is this environment's —
# taken from the contract rather than hardcoded here.
function ensure_service_data_dirs() {
  mkdir -p "$(dirname "$SQLITE_DATABASE_PATH")"
}

PROJECT_ROOT=$(cd "$DIR/.."; pwd)
if [ ! -d "$PROJECT_ROOT/.secrets" ]; then
  echo "Creating $PROJECT_ROOT/.secrets"
  mkdir -p "$PROJECT_ROOT/.secrets"
  pnpm dev:secrets:gen
fi

if $dependencies; then
  start_dependencies
  wait_for_dependencies
  echo
  echo "The shared dependencies are up. Start an environment's services with: pnpm dev --only-services"
  exit 0
elif $services; then
  wait_for_dependencies
  ensure_secrets
  resolve_environment
  ensure_service_data_dirs
  print_environment
  provision_environment
  pnpm run start
  exit 0
fi

echo
echo -e "This command starts the OpenCRVS Core development environment, which consists of multiple NodeJS microservices running in parallel on many ports.  OpenCRVS requires a companion country configuration server to also be running. \n\nCore, by default, starts the testland countryconfig bundled with the core monorepo.\n\nIf you want to run your own countryconfig instead, run this command with --no-testland flag and do the following:\n\n1. Copy this command: \033[32mpnpm dev \033[0m\n\n2. Create another terminal window.\n\n3. cd into your country config directory and prepare to run the command in that terminal window \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m\n\nin order to start the country config server and be able to use OpenCRVS.\n\nOpenCRVS has started up fully when the terminal logs slow and stop. \n\nBrowse to this URL in Chrome to check the status:\033[32m\n\nhttps://is-my-opencrvs-up.netlify.app\033[0m \n\nIf your OpenCRVS database is not seeded, open another terminal window and cd into opencrvs-core.  Run this command in the opencrvs-core directory \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m in order to seed the database with data: \033[32m\n\npnpm seed:dev\033[0m\n\n"
echo

sleep 3

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}

if [[ "no" == $(ask_yes_or_no "If you are ready to continue, type: yes.  If you dont know, type: no to exit.") ]]
then
    echo -e "\n\nExiting OpenCRVS."
    exit 0
fi

start_dependencies
wait_for_dependencies
ensure_secrets
resolve_environment
ensure_service_data_dirs
print_environment
provision_environment

echo
echo -e "\033[32m:::::::::: STARTING OPENCRVS ::::::::::\033[0m"
echo
echo "If you did not previously run our setup command, Docker is downloading ElasticSearch docker images.  These are large files.  Then docker will build them.  If you did run our setup command, OpenCRVS will start much faster. Wait for the OpenCRVS stack to start up completely (output will slow and gradually stop ...), then OpenCRVS Core will be available."
echo
echo -e "\033[32m:::::::::: PLEASE WAIT for @opencrvs/client ::::::::::\033[0m"
echo

pnpm run start

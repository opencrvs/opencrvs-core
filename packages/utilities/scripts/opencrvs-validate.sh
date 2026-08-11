#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -u
set -o pipefail

MODE="all"
DOMAIN="${DOMAIN:-}"
CERT_ENDPOINT="${CERT_ENDPOINT:-}"
MONITORING_ENABLED="${MONITORING_ENABLED:-${OPENCRVS_MONITORING_ENABLED:-true}}"
ALLOW_INSECURE_HTTPS="${ALLOW_INSECURE_HTTPS:-false}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-5}"
EMAIL_CHECK_URL="${EMAIL_CHECK_URL:-}"

POSTGRES_HOST="${POSTGRES_HOST:-}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-${ELASTICSEARCH_URI:-}}"
ELASTICSEARCH_PORT="${ELASTICSEARCH_PORT:-9200}"
MINIO_HOST="${MINIO_HOST:-}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_URL="${MINIO_URL:-}"
REDIS_HOST="${REDIS_HOST:-}"
REDIS_PORT="${REDIS_PORT:-6379}"

SMTP_HOST="${SMTP_HOST:-}"
SMTP_PORT="${SMTP_PORT:-}"
SENDER_EMAIL_ADDRESS="${SENDER_EMAIL_ADDRESS:-}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
TWO_FA_ENABLED="${TWO_FA_ENABLED:-${TWOFA_ENABLED:-false}}"

FAILURES=0
WARNINGS=0
CERT_FILE=""
CERTIFICATE_FETCH_ERROR=""
PUBLIC_DOMAINS=()
CHECK_NAMES=()
CHECK_STATUSES=()
CHECK_REASONS=()

usage() {
  cat <<'EOF'
Usage: opencrvs-validate.sh [predeploy|postdeploy|all] [options]

Validates an OpenCRVS environment.

Modes:
  predeploy                       Checks configuration and internal dependencies
                                  before deployment.
  postdeploy                      Checks public endpoint DNS, SSL certificate
                                  coverage, HTTPS, Events service readiness
                                  and external service reachability after
                                  deployment.
  all                             Runs both predeploy and postdeploy checks.
                                  This is the default mode.

Options:
  --domain <domain>               Base domain, e.g. example.opencrvs.org.
                                  Required for postdeploy and all modes.
  --cert-endpoint <endpoint>      Internal TLS endpoint to fetch the SSL
                                  certificate from. Accepts host:port or URL.
                                  Defaults to gateway.<domain>:443.
  --monitoring-enabled <bool>     Include kibana.<domain> checks when true.
                                  Defaults to MONITORING_ENABLED or true.
  --allow-insecure-https <bool>   Allow HTTPS checks to use certificates signed
                                  by private, staging or self-signed CAs.
                                  Defaults to ALLOW_INSECURE_HTTPS or false.
  --timeout <seconds>             Network timeout. Defaults to 5.
  --help                          Show this help.

Environment variables:
  Datastores:
    POSTGRES_HOST [POSTGRES_PORT=5432]
    ELASTICSEARCH_HOST or ELASTICSEARCH_URI [ELASTICSEARCH_PORT=9200]
    MINIO_HOST [MINIO_PORT=9000]
    REDIS_HOST [REDIS_PORT=6379]

  SMTP / 2FA:
    SMTP_HOST
    SMTP_PORT
    TWO_FA_ENABLED or TWOFA_ENABLED

  TLS:
    CERT_ENDPOINT
    ALLOW_INSECURE_HTTPS

  Send email:
    EMAIL_CHECK_URL
    SENDER_EMAIL_ADDRESS
    ALERT_EMAIL
EOF
}

if [ "$#" -gt 0 ]; then
  case "$1" in
    predeploy|postdeploy|all)
      MODE="$1"
      shift
      ;;
  esac
fi

while [ "$#" -gt 0 ]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --cert-endpoint)
      CERT_ENDPOINT="${2:-}"
      shift 2
      ;;
    --monitoring-enabled)
      MONITORING_ENABLED="${2:-}"
      shift 2
      ;;
    --allow-insecure-https)
      ALLOW_INSECURE_HTTPS="${2:-}"
      shift 2
      ;;
    --timeout)
      TIMEOUT_SECONDS="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 2
      ;;
  esac
done

cleanup() {
  if [ -n "$CERT_FILE" ] && [ -f "$CERT_FILE" ]; then
    rm -f "$CERT_FILE"
  fi
}
trap cleanup EXIT

section() {
  printf '\n== %s ==\n' "$1"
}

pass() {
  record_check "$1" "Ok" "${2:-}"
}

warn() {
  record_check "$1" "Warning" "${2:-}"
}

fail() {
  record_check "$1" "Failed" "${2:-}"
}

record_check() {
  local name="$1"
  local status="$2"
  local reason="${3:-}"

  CHECK_NAMES+=("$name")
  CHECK_STATUSES+=("$status")
  CHECK_REASONS+=("$reason")

  echo "${status}: ${name} - ${reason}"
}

markdown_escape() {
  local value="$1"
  value="${value//$'\r'/ }"
  value="${value//$'\n'/ }"
  value="${value//|/\\|}"
  printf '%s' "$value"
}

print_markdown_summary() {
  local index

  printf '\n<!-- OPENCRVS_VALIDATION_SUMMARY_START -->\n'
  printf '| Check name | Check status | Reason |\n'
  printf '| --- | --- | --- |\n'

  for index in "${!CHECK_NAMES[@]}"; do
    printf '| %s | %s | %s |\n' \
      "$(markdown_escape "${CHECK_NAMES[$index]}")" \
      "$(markdown_escape "${CHECK_STATUSES[$index]}")" \
      "$(markdown_escape "${CHECK_REASONS[$index]}")"
  done

  printf '<!-- OPENCRVS_VALIDATION_SUMMARY_END -->\n'
}

strip_scheme() {
  local value="$1"
  value="${value#*://}"
  value="${value%%/*}"
  printf '%s' "$value"
}

endpoint_host() {
  local endpoint
  endpoint="$(strip_scheme "$1")"

  if [ "${endpoint#*:}" != "$endpoint" ]; then
    printf '%s' "${endpoint%%:*}"
  else
    printf '%s' "$endpoint"
  fi
}

endpoint_port() {
  local endpoint
  endpoint="$(strip_scheme "$1")"

  if [ "${endpoint#*:}" != "$endpoint" ]; then
    printf '%s' "${endpoint##*:}"
  else
    printf '443'
  fi
}

normalise_host() {
  local value="$1"
  value="$(strip_scheme "$value")"
  value="${value#*@}"
  value="${value%%:*}"
  printf '%s' "$value"
}

normalise_port() {
  local value="$1"
  local fallback="$2"
  value="$(strip_scheme "$value")"

  if [ "${value#*:}" != "$value" ]; then
    printf '%s' "${value##*:}"
  else
    printf '%s' "$fallback"
  fi
}

tcp_available() {
  local host="$1"
  local port="$2"

  if command -v nc >/dev/null 2>&1; then
    nc -z -G "$TIMEOUT_SECONDS" "$host" "$port" >/dev/null 2>&1 ||
      nc -z -w "$TIMEOUT_SECONDS" "$host" "$port" >/dev/null 2>&1
    return $?
  fi

  if command -v timeout >/dev/null 2>&1; then
    timeout "$TIMEOUT_SECONDS" bash -c ":</dev/tcp/$host/$port" >/dev/null 2>&1
    return $?
  fi

  bash -c ":</dev/tcp/$host/$port" >/dev/null 2>&1
}

resolve_domain() {
  local host="$1"

  if command -v dig >/dev/null 2>&1; then
    [ -n "$(dig +short A "$host" 2>/dev/null; dig +short AAAA "$host" 2>/dev/null)" ]
    return $?
  fi

  if command -v getent >/dev/null 2>&1; then
    getent hosts "$host" >/dev/null 2>&1
    return $?
  fi

  nslookup "$host" >/dev/null 2>&1
}

resolve_domain_ips() {
  local host="$1"
  local resolved=""

  if command -v dig >/dev/null 2>&1; then
    resolved="$(
      {
      dig +short A "$host" 2>/dev/null
      dig +short AAAA "$host" 2>/dev/null
      } | grep -E '(^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$|:)' | sort -u
    )"
    if [ -n "$resolved" ]; then
      printf '%s\n' "$resolved"
      return
    fi
  fi

  if command -v getent >/dev/null 2>&1; then
    resolved="$(getent hosts "$host" 2>/dev/null | awk '{ print $1 }' | sort -u)"
    if [ -n "$resolved" ]; then
      printf '%s\n' "$resolved"
      return
    fi
  fi

  nslookup "$host" 2>/dev/null |
    awk '
      /^Name:/ { found = 1; next }
      found && /^Address:$/ { print $2; next }
      found && /^Address[[:space:]][0-9]+:/ { print $3; next }
      found && /^Address:/ { print $2; next }
    ' |
    sort -u
}

is_public_ipv4() {
    case "$1" in
        10.*) return 1 ;;
        192.168.*) return 1 ;;
        172.1[6-9].*|172.2[0-9].*|172.3[0-1].*) return 1 ;;
        *) return 0 ;;
    esac
}

is_public_ipv6() {
  local ip
  ip="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"

  case "$ip" in
    ::|::1|fe80:*|fc*|fd*|ff*|2001:db8:*) return 1 ;;
    *:*) return 0 ;;
    *) return 1 ;;
  esac
}

is_public_ip() {
  local ip="$1"

  case "$ip" in
    *.*) is_public_ipv4 "$ip" ;;
    *:*) is_public_ipv6 "$ip" ;;
    *) return 1 ;;
  esac
}

http_available() {
  local host="$1"
  local curl_args=(
    --silent
    --show-error
    --head
    --location
    --max-time "$TIMEOUT_SECONDS"
  )

  if [ "$ALLOW_INSECURE_HTTPS" == "true" ]; then
    curl_args+=(--insecure)
  fi

  curl "${curl_args[@]}" "https://$host" >/dev/null 2>&1
}

fetch_url() {
  local url="$1"
  local output_file="$2"
  local curl_args=(
    --silent
    --show-error
    --location
    --max-time "$TIMEOUT_SECONDS"
    --output "$output_file"
    --write-out "%{http_code}"
  )

  if [ "$ALLOW_INSECURE_HTTPS" == "true" ]; then
    curl_args+=(--insecure)
  fi

  curl "${curl_args[@]}" "$url"
}

check_tcp_service() {
  local name="$1"
  local host="$2"
  local port="$3"
  local check_name="Datastore $name"

  if [ -z "$host" ]; then
    fail "$check_name" "$name host is not configured"
    return
  fi

  if [ -z "$port" ]; then
    fail "$check_name" "$name port is not configured"
    return
  fi

  if tcp_available "$host" "$port"; then
    pass "$check_name"
  else
    fail "$check_name" "$name is not reachable at $host:$port"
  fi
}

fetch_certificate() {
  local endpoint="$1"
  local server_name="$2"
  local host
  local port

  CERTIFICATE_FETCH_ERROR=""
  host="$(endpoint_host "$endpoint")"
  port="$(endpoint_port "$endpoint")"
  CERT_FILE="$(mktemp)"

  if openssl s_client \
    -connect "$host:$port" \
    -servername "$server_name" \
    -showcerts </dev/null 2>/dev/null |
    openssl x509 -outform PEM >"$CERT_FILE" 2>/dev/null; then
    return 0
  else
    CERTIFICATE_FETCH_ERROR="SSL certificate fetch failed: Could not fetch SSL certificate from $host:$port"
    return 1
  fi
}

cert_sans() {
  openssl x509 -in "$CERT_FILE" -noout -ext subjectAltName 2>/dev/null |
    tr ',' '\n' |
    sed -n 's/.*DNS:[[:space:]]*//p' |
    sed 's/[[:space:]]*$//'
}

san_matches_domain() {
  local san="$1"
  local host="$2"

  if [ "$san" = "$host" ]; then
    return 0
  fi

  case "$san" in
    "*."*)
      local suffix="${san#*.}"
      local host_remainder="${host#*.}"
      [ "$host" != "$host_remainder" ] && [ "$host_remainder" = "$suffix" ]
      return $?
      ;;
    *)
      return 1
      ;;
  esac
}

certificate_covers_domain() {
  local host="$1"
  local san

  while IFS= read -r san; do
    if san_matches_domain "$san" "$host"; then
      return 0
    fi
  done <<EOF
$(cert_sans)
EOF

  return 1
}

check_public_endpoint() {
  local host="$1"
  local check_name="Public endpoint $host"

  if ! resolve_domain "$host"; then
    fail "$check_name" "DNS failed: $host does not resolve in DNS"
    return
  fi

  if ! fetch_certificate "$CERT_ENDPOINT" "$host"; then
    fail "$check_name" "$CERTIFICATE_FETCH_ERROR"
    return
  fi

  if ! certificate_covers_domain "$host"; then
    fail "$check_name" "SSL certificate SAN failed: SSL certificate does not cover $host"
    return
  fi

  if ! http_available "$host"; then
    fail "$check_name" "HTTPS failed: $host is not available over HTTPS"
    return
  fi

  pass "$check_name"
}

check_public_domains_do_not_resolve_to_public_ip() {
  local check_name="Public endpoint DNS target"
  local domain
  local domain_ip
  local matches=""

  for domain in "${PUBLIC_DOMAINS[@]}"; do
    while IFS= read -r domain_ip; do
      if [ -n "$domain_ip" ] && is_public_ip "$domain_ip"; then
        if [ -n "$matches" ]; then
          matches="$matches, "
        fi
        matches="${matches}${domain} -> ${domain_ip}"
      fi
    done <<EOF
$(resolve_domain_ips "$domain")
EOF
  done

  if [ -n "$matches" ]; then
    warn "$check_name" "OpenCRVS application domain DNS resolves to public IP address: $matches"
  else
    pass "$check_name" "OpenCRVS application domains do not resolve to public IP addresses"
  fi
}

check_events_service_status() {
  local check_name="Events service status"
  local url="https://events.${DOMAIN}/health/ready"
  local response_file
  local curl_output
  local curl_status
  local http_status
  local response_body
  local failed_checks
  local overall_status

  response_file="$(mktemp)"
  curl_output="$(fetch_url "$url" "$response_file" 2>&1)"
  curl_status=$?
  curl_output="${curl_output//$'\r'/ }"
  curl_output="${curl_output//$'\n'/ }"
  curl_output="${curl_output% 000}"
  http_status="$curl_output"
  response_body="$(cat "$response_file" 2>/dev/null)"
  rm -f "$response_file"

  if [ "$curl_status" -ne 0 ]; then
    fail "$check_name" "Events readiness endpoint failed: $curl_output"
    return
  fi

  if ! printf '%s' "$response_body" | jq empty >/dev/null 2>&1; then
    fail "$check_name" "Events readiness endpoint returned HTTP $http_status with invalid JSON"
    return
  fi

  failed_checks="$(
    printf '%s' "$response_body" |
      jq -r '
        (.checks // {})
        | to_entries
        | map(select(.value.status != "ok"))
        | map(.key + " (" + (.value.error // .value.status // "unknown error") + ")")
        | join(", ")
      '
  )"

  if [ -n "$failed_checks" ]; then
    fail "$check_name" "Events readiness dependency check failed: $failed_checks"
    return
  fi

  overall_status="$(printf '%s' "$response_body" | jq -r '.status // "missing"')"
  if [ "$overall_status" != "ok" ]; then
    fail "$check_name" "Events readiness status is $overall_status"
    return
  fi

  case "$http_status" in
    2*) pass "$check_name" ;;
    *) fail "$check_name" "Events readiness endpoint returned HTTP $http_status" ;;
  esac
}

check_smtp_config() {
  local two_fa_enabled="$1"

  if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_PORT" ]; then
    if [ "$two_fa_enabled" == "true" ]; then
      fail "SMTP configuration" "SMTP_HOST and SMTP_PORT must be configured when TWO_FA_ENABLED=true"
    else
      warn "SMTP configuration" "SMTP_HOST or SMTP_PORT is empty while TWO_FA_ENABLED=false"
    fi
    return
  fi

  pass "SMTP configuration"
}

check_smtp_reachability() {
  if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_PORT" ]; then
    return
  fi

  if tcp_available "$SMTP_HOST" "$SMTP_PORT"; then
    pass "SMTP connectivity"
  else
    fail "SMTP connectivity" "SMTP is not reachable at $SMTP_HOST:$SMTP_PORT"
  fi
}

check_send_email() {
  local check_name="Send email check"
  local url="${EMAIL_CHECK_URL:-http://countryconfig:3040/email}"
  local subject="OpenCRVS validation email"
  local html="OpenCRVS validation email sent by opencrvs-validate.sh."
  local payload
  local response_file
  local curl_output
  local curl_status

  if [ -z "$SENDER_EMAIL_ADDRESS" ] || [ -z "$ALERT_EMAIL" ]; then
    if [ "$TWO_FA_ENABLED" == "true" ]; then
      fail "$check_name" "SENDER_EMAIL_ADDRESS and ALERT_EMAIL must be configured when TWO_FA_ENABLED=true"
    else
      warn "$check_name" "SENDER_EMAIL_ADDRESS or ALERT_EMAIL is empty while TWO_FA_ENABLED=false"
    fi
    return
  fi

  payload="$(
    jq -n \
      --arg subject "$subject" \
      --arg html "$html" \
      --arg from "$SENDER_EMAIL_ADDRESS" \
      --arg to "$ALERT_EMAIL" \
      '{ subject: $subject, html: $html, from: $from, to: $to }'
  )"

  response_file="$(mktemp)"
  curl_output="$(
    curl \
      --request POST \
      --header 'Content-Type: application/json' \
      --data "$payload" \
      --connect-timeout "$TIMEOUT_SECONDS" \
      --max-time "$TIMEOUT_SECONDS" \
      --fail \
      --silent \
      --show-error \
      --output "$response_file" \
      "$url" 2>&1
  )"
  curl_status=$?
  curl_output="${curl_output//$'\r'/ }"
  curl_output="${curl_output//$'\n'/ }"
  rm -f "$response_file"

  if [ "$curl_status" -eq 0 ]; then
    pass "$check_name"
  else
    fail "$check_name" "Could not send validation email via countryconfig endpoint: $curl_output"
  fi
}

normalise_configuration() {
  local postgres_endpoint="$POSTGRES_HOST"
  local elasticsearch_endpoint="$ELASTICSEARCH_HOST"
  local minio_endpoint="$MINIO_HOST"
  local redis_endpoint="$REDIS_HOST"

  POSTGRES_HOST="$(normalise_host "$postgres_endpoint")"
  POSTGRES_PORT="$(normalise_port "$postgres_endpoint" "$POSTGRES_PORT")"
  ELASTICSEARCH_HOST="$(normalise_host "$elasticsearch_endpoint")"
  ELASTICSEARCH_PORT="$(normalise_port "$elasticsearch_endpoint" "$ELASTICSEARCH_PORT")"
  MINIO_HOST="$(normalise_host "$minio_endpoint")"
  MINIO_PORT="$(normalise_port "$minio_endpoint" "$MINIO_PORT")"
  REDIS_HOST="$(normalise_host "$redis_endpoint")"
  REDIS_PORT="$(normalise_port "$redis_endpoint" "$REDIS_PORT")"
}

configure_public_domains() {
  local minio_url="${MINIO_URL:-minio.$DOMAIN}"

  PUBLIC_DOMAINS=(
    "gateway.$DOMAIN"
    "login.$DOMAIN"
    "register.$DOMAIN"
    "countryconfig.$DOMAIN"
    "events.$DOMAIN"
    "metabase.$DOMAIN"
    "$minio_url"
  )

  if [ "$MONITORING_ENABLED" == "true" ]; then
    PUBLIC_DOMAINS+=("kibana.$DOMAIN")
  fi
}

run_predeploy() {
  section "Preflight datastore availability"
  check_tcp_service "Postgres" "$POSTGRES_HOST" "$POSTGRES_PORT"
  check_tcp_service "Elasticsearch" "$ELASTICSEARCH_HOST" "$ELASTICSEARCH_PORT"
  check_tcp_service "MinIO" "$MINIO_HOST" "$MINIO_PORT"
  check_tcp_service "Redis" "$REDIS_HOST" "$REDIS_PORT"

  section "Preflight SMTP configuration"
  check_smtp_config "$TWO_FA_ENABLED"
}

run_postdeploy() {
  section "Postdeploy public endpoints"
  for host in "${PUBLIC_DOMAINS[@]}"; do
    check_public_endpoint "$host"
  done
  check_public_domains_do_not_resolve_to_public_ip

  section "Postdeploy service readiness"
  check_events_service_status

  section "Postdeploy SMTP reachability"
  check_smtp_config "$TWO_FA_ENABLED"
  check_smtp_reachability
  check_send_email
}

summarise() {
  section "Summary"
  print_markdown_summary

  if [ "$FAILURES" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
      printf '\nOK: %s validation checks passed\n' "$MODE"
    else
      printf '\nOK: %s validation passed with %s warning(s)\n' "$MODE" "$WARNINGS"
    fi
    exit 0
  fi

  printf '\nFAIL: %s validation failed with %s failure(s) and %s warning(s)\n' \
    "$MODE" "$FAILURES" "$WARNINGS"
  exit 1
}

if [ "$MODE" != "predeploy" ] && [ -z "$DOMAIN" ]; then
  echo "Missing required --domain for $MODE mode."
  usage
  exit 2
fi

normalise_configuration

if [ "$MODE" != "predeploy" ]; then
  CERT_ENDPOINT="${CERT_ENDPOINT:-gateway.$DOMAIN:443}"
  configure_public_domains
fi

case "$MODE" in
  predeploy)
    run_predeploy
    ;;
  postdeploy)
    run_postdeploy
    ;;
  all)
    run_predeploy
    run_postdeploy
    ;;
esac

summarise

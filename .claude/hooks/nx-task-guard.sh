#!/usr/bin/env bash
# PreToolUse(Bash) guard: keeps package tasks on nx, which rebuilds changed
# dependencies (`^build`) before running them. A bare vitest/tsc runs against
# whatever `build/` already holds, so its failures may belong to a stale
# artifact rather than the code under test.
# stdin: {"tool_input":{"command":"..."},"cwd":"..."}; exit 2 blocks the call.
set -u

payload=$(timeout 2 cat 2>/dev/null || true)
command=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || true)
cwd=$(printf '%s' "$payload" | jq -r '.cwd // empty' 2>/dev/null || true)

[ -n "$command" ] || exit 0

# nx and lerna run these binaries themselves; only direct calls are guarded.
printf '%s' "$command" | grep -qE '\b(nx|lerna)\b' && exit 0

# countryconfig-template is outside pnpm-workspace.yaml, so nx has no project
# for it and its own scripts are the only way in.
printf '%s\n%s' "$command" "$cwd" | grep -q 'countryconfig-template' && exit 0

binary=$(printf '%s' "$command" \
  | grep -oE '(^|[;&|] *|\bnpx +|\bpnpm +(exec +|dlx +)?)(vitest|tsc|jest)\b' \
  | grep -oE '(vitest|tsc|jest)$' \
  | head -1)

[ -n "$binary" ] || exit 0

# Name the project when the command or the session sits inside a package.
package=$(printf '%s\n%s' "$command" "$cwd" | grep -oE 'packages/[a-z0-9-]+' | head -1 | cut -d/ -f2)
project="@opencrvs/${package:-<package>}"

case "$binary" in
  tsc) target='test:compilation' ;;
  *) target='test' ;;
esac

cat >&2 <<MESSAGE
Blocked: \`$binary\` called directly. Package tasks run through nx, which
rebuilds changed dependencies first — a direct call tests whatever \`build/\`
already holds, and stale artifacts produce failures that look real.

Run instead:
  nx run $project:$target            # trailing args reach $binary, e.g. -- src/router/user

See "Running tasks" in CLAUDE.md.
MESSAGE
exit 2

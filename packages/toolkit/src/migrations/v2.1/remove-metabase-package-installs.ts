/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

/**
 * Codemod: Stop the Metabase startup scripts installing packages over the
 * internet.
 *
 * `run.sh` used to `apk add gettext util-linux` on every start. Since chart
 * v2.1.0 the dashboards Deployment renders NetworkPolicies and the chart
 * default `network_policy.egress_mode: private` allows RFC1918 only, so the
 * fetch to dl-cdn.alpinelinux.org is dropped, apk reports "Permission denied"
 * and Metabase never starts. Both tools have in-image equivalents:
 *
 *   - uuidgen (util-linux) -> /proc/sys/kernel/random/uuid, keeping uuidgen
 *     as the fallback for local macOS runs
 *   - envsubst (gettext)   -> bash's own heredoc expansion
 *
 * This is the country-config side of core's #13778, which fixed the same
 * scripts in `countryconfig-template` and `testland` — i.e. only for newly
 * scaffolded country configs.
 *
 * What it does:
 *   Rewrites `run.sh` and `update-database.sh` under `infrastructure/metabase/`
 *   (and `assets/metabase/`, in case the directory has already been renamed)
 *   to match the fixed upstream versions.
 *
 * Caveats:
 *   - Anchored on the exact upstream v2.0 wording. A script that was edited
 *     locally is left alone with a warning rather than half-patched, and the
 *     dev applies core's #13778 by hand.
 *   - No-op when the files are absent (Swarm configs that dropped
 *     `infrastructure/`, or configs scaffolded from the fixed template).
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const METABASE_DIRS = ['infrastructure/metabase', 'assets/metabase']

// ─── run.sh ──────────────────────────────────────────────────────────────────

const APK_BLOCK = [
  'apk update',
  'apk upgrade',
  'apk add --no-cache gettext',
  'apk add --no-cache util-linux',
  '',
  ''
].join('\n')

const SALT_LINE = 'export OPENCRVS_METABASE_ADMIN_PASSWORD_SALT=$(uuidgen)\n'

const FIXED_SALT_LINE =
  'export OPENCRVS_METABASE_ADMIN_PASSWORD_SALT=' +
  '$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)\n\n'

const FIXED_SALT_MARKER = '/proc/sys/kernel/random/uuid'

// ─── update-database.sh ──────────────────────────────────────────────────────

const ENVSUBST_GUARD = [
  'if ! which envsubst >/dev/null; then',
  '  echo "envsubst could not be found. Please install envsubst before continuing."',
  '  echo "MacOS: brew install gettext && brew link --force gettext"',
  '  exit 1',
  'fi',
  ''
].join('\n')

const ENVSUBST_CALL =
  'envsubst < $environment_configuration_sql_file > ' +
  '$environment_configuration_sql_file.tmp\n'

const FIXED_EXPANSION = [
  '',
  "# Expand $VAR / ${VAR} using bash's own heredoc expansion instead of envsubst,",
  '# because envsubst is not installed in the Metabase image',
  'eval "cat <<OPENCRVS_ENV_EOF',
  '$(cat "$environment_configuration_sql_file")',
  'OPENCRVS_ENV_EOF" > "$environment_configuration_sql_file.tmp"',
  ''
].join('\n')

const FIXED_EXPANSION_MARKER = 'OPENCRVS_ENV_EOF'

/**
 * Rewrites `run.sh` to read the salt from the kernel instead of installing
 * util-linux for uuidgen.
 *
 * Returns the source unchanged when it is already fixed, and `undefined` when
 * it does not match the upstream v2.0 wording — the caller warns and skips.
 */
export function patchRunScript(source: string): string | undefined {
  if (source.includes(FIXED_SALT_MARKER) && !source.includes(APK_BLOCK)) {
    return source
  }

  if (!source.includes(APK_BLOCK) || !source.includes(SALT_LINE)) {
    return undefined
  }

  return source.replace(APK_BLOCK, '').replace(SALT_LINE, FIXED_SALT_LINE)
}

/**
 * Rewrites `update-database.sh` to expand the environment configuration with
 * bash instead of installing gettext for envsubst.
 *
 * Returns the source unchanged when it is already fixed, and `undefined` when
 * it does not match the upstream v2.0 wording — the caller warns and skips.
 */
export function patchUpdateDatabaseScript(source: string): string | undefined {
  if (
    source.includes(FIXED_EXPANSION_MARKER) &&
    !source.includes(ENVSUBST_CALL)
  ) {
    return source
  }

  if (!source.includes(ENVSUBST_GUARD) || !source.includes(ENVSUBST_CALL)) {
    return undefined
  }

  return source
    .replace(ENVSUBST_GUARD, '')
    .replace(ENVSUBST_CALL, FIXED_EXPANSION)
}

/**
 * Applies `patch` to `relativePath`, writing it back only when the contents
 * actually change. Warns and leaves the file alone when it has been edited
 * locally, because a half-patched script still fails to start — silently.
 */
function patchFile(
  relativePath: string,
  patch: (source: string) => string | undefined,
  removed: string
): void {
  const filePath = join(process.cwd(), relativePath)

  if (!existsSync(filePath)) {
    return
  }

  const source = readFileSync(filePath, 'utf8')
  const patched = patch(source)

  if (patched === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      `  ⚠️  ${relativePath} does not match the upstream v2.0 version, so it ` +
        `was left alone. Apply ` +
        `https://github.com/opencrvs/opencrvs-core/pull/13778 by hand, or ` +
        `Metabase will fail to start behind the chart's private egress policy.`
    )
    return
  }

  if (patched === source) {
    return
  }

  writeFileSync(filePath, patched)
  // eslint-disable-next-line no-console
  console.log(`  ✓ ${relativePath}: ${removed}`)
}

export async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('\nRemoving the Metabase package installs...\n')

  for (const dir of METABASE_DIRS) {
    patchFile(join(dir, 'run.sh'), patchRunScript, 'apk add gettext util-linux')
    patchFile(
      join(dir, 'update-database.sh'),
      patchUpdateDatabaseScript,
      'envsubst'
    )
  }
}

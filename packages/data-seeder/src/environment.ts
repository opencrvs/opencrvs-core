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
import { bool, cleanEnv, str, url } from 'envalid'

/**
 * Legacy spellings of the two peer addresses.
 *
 * The seeder used to read `GATEWAY_HOST` / `COUNTRY_CONFIG_HOST`, which no
 * local environment ever set, so it always fell back to its devDefaults and
 * seeded slot 0 whichever environment it was run from. The canonical names are
 * now `GATEWAY_URL` / `COUNTRY_CONFIG_URL`: those are the names the environment
 * contract emits (`packages/dev-cli/src/env-contract.ts`) and the names every
 * other service already receives, and they say what the values are — full URLs,
 * not hostnames.
 *
 * The `_HOST` spellings are kept as deprecated fallbacks, and only as
 * fallbacks, because they are also deployment variables set outside this
 * repository (see `packages/toolkit/src/environment`), where `pnpm seed:prod`
 * relies on them. Note `COUNTRY_CONFIG_HOST` means something *different* in
 * `packages/testland` and `packages/countryconfig-template` — the address the
 * country config server binds to, `0.0.0.0` — which is exactly why the
 * contract cannot simply export it, and why the URL spelling wins here.
 */
const withLegacyAliases = (source: NodeJS.ProcessEnv): NodeJS.ProcessEnv => ({
  ...source,
  COUNTRY_CONFIG_URL: source.COUNTRY_CONFIG_URL ?? source.COUNTRY_CONFIG_HOST,
  GATEWAY_URL: source.GATEWAY_URL ?? source.GATEWAY_HOST
})

export const env = cleanEnv(withLegacyAliases(process.env), {
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  GATEWAY_URL: url({ devDefault: 'http://localhost:7070' }),
  SUPER_USER_PASSWORD: str({ devDefault: 'password' }),
  ACTIVATE_USERS: bool({ devDefault: true })
})

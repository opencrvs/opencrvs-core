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

type Config = typeof window.config

/*
 * The following logic is temporary logic so that Events v2 can be tested as the "primary"
 * events. This will be removed once Events v2 is published.
 *
 * Country configuration, as part of its config can define a flag FEATURES.V2_EVENTS = true
 * that enables the same mode. The following logic overrides that config and makes it configurable
 * in the client.
 * The overrides are primarily read from local storage. The values in local storage can be controlled by
 * setting up the URL parameters. For example, to enable V2_EVENTS, the URL can be:
 *
 * http://localhost:3000/?V2_EVENTS=true
 * http://localhost:3000/?V2_EVENTS=false
 */

const localFeaturesOverrides = JSON.parse(
  localStorage.getItem('config') || '{}'
) as Partial<Config['FEATURES']>

const urlParams = new URLSearchParams(window.location.search)
const allowedParams = ['V2_EVENTS'] as const satisfies Array<
  keyof typeof localFeaturesOverrides
>

allowedParams.forEach((param) => {
  if (urlParams.has(param)) {
    localFeaturesOverrides[param] = urlParams.get(param) === 'true'
    localStorage.setItem('config', JSON.stringify(localFeaturesOverrides))
  }
})

export const config = {
  ...window.config,
  FEATURES: {
    ...window.config.FEATURES,
    ...localFeaturesOverrides
  }
}

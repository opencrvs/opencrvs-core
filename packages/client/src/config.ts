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

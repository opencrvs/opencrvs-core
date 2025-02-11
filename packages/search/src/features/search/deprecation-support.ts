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
import { IAdvancedSearchParam } from './types'

/** Supports pre-v1.5 external system integrations which may use some of the parameters we don't internally anymore. */
export function transformDeprecatedParamsToSupported({
  eventLocationLevel1,
  eventLocationLevel2,
  eventLocationLevel3,
  eventLocationLevel4,
  eventLocationLevel5,
  eventLocationLevel6,
  eventJurisdictionId,
  ...params
}: IAdvancedSearchParam) {
  let leafLevel = eventLocationLevel1

  if (eventLocationLevel2) leafLevel = eventLocationLevel2
  if (eventLocationLevel3) leafLevel = eventLocationLevel3
  if (eventLocationLevel4) leafLevel = eventLocationLevel4
  if (eventLocationLevel5) leafLevel = eventLocationLevel5
  if (eventLocationLevel6) leafLevel = eventLocationLevel6
  if (!eventJurisdictionId) eventJurisdictionId = leafLevel

  return {
    ...params,
    eventJurisdictionId
  }
}

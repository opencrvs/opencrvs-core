/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { LOCATION_LEVEL, GATEWAY_URL } from '@config/config/constants'
import { IDataSetModel } from '@config/models/formDataset'
import { ISelectOption } from '@config/models/question'
import fetch from 'node-fetch'

export const locationService = async (query: any) => {
  const queryObj = { ...query, _count: 0 }

  const locationUrl = new URL(
    `location?${Object.keys(queryObj)
      .map((key) => key + '=' + queryObj[key])
      .join('&')}`,
    GATEWAY_URL
  ).toString()

  const locations = await fetch(locationUrl)
  const facilities = await locations.json()

  return facilities.entry.map((i: any) => ({
    value: i.resource.id,
    label: [
      {
        lang: 'en',
        descriptor: {
          id: i.resource.id,
          defaultMessage: i.resource.name
        }
      }
    ]
  })) as ISelectOption[]
}

export async function resolveFormDatasetOptions(formDataset: IDataSetModel) {
  let options: ISelectOption[] = formDataset.options
  if (formDataset.resource === LOCATION_LEVEL.HEALTH_FACILITY) {
    options = await locationService({
      type: LOCATION_LEVEL.HEALTH_FACILITY
    })
  } else if (formDataset.resource === LOCATION_LEVEL.STATE) {
    options = await locationService({
      identifier: LOCATION_LEVEL.STATE
    })
  } else if (formDataset.resource === LOCATION_LEVEL.DISTRICT) {
    options = await locationService({
      identifier: LOCATION_LEVEL.DISTRICT
    })
  }
  return options
}

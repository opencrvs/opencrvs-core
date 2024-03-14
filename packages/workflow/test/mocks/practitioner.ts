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
import { Practitioner } from '@opencrvs/commons/types'

export const practitioner: Practitioner = {
  resourceType: 'Practitioner',
  identifier: [],
  telecom: [
    {
      system: 'phone',
      value: '0911111111'
    },
    {
      system: 'email',
      value: ''
    }
  ],
  name: [
    {
      use: 'en',
      family: 'Bwalya',
      given: ['Kalusha']
    }
  ],
  meta: {
    lastUpdated: '2023-11-29T07:02:39.305+00:00',
    versionId: '4b7aa336-8922-45e3-b1d4-45e25e3d5a6a'
  },
  id: '4651d1cc-6072-4e34-bf20-b583f421a9f1'
}

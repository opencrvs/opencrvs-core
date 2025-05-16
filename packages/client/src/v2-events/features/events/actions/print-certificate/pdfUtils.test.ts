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

import { createIntl } from 'react-intl'
import { eventQueryDataGenerator, User } from '@opencrvs/commons/client'
import { stringifyEventMetadata } from './pdfUtils'

const locations = [
  {
    id: '35391063-7dca-4e57-abd3-20dcc8538a64',
    externalId: '2OKicPQMNI',
    name: 'HQ Office',
    partOf: 'f09c8dda-2156-420a-8215-2beda4c81d66'
  },
  {
    id: 'f09c8dda-2156-420a-8215-2beda4c81d66',
    externalId: 'BxrIbNW7f3K',
    name: 'Embe',
    partOf: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64'
  },
  {
    id: '7ef2b9c7-5e6d-49f6-ae05-656207d0fc64',
    externalId: 'B1u1bVtIA92',
    name: 'Pualula',
    partOf: null
  }
]
const userId = '677fb08730f3abfa33072769'

describe('stringifyEventMetadata', () => {
  test('Resolves event metadata', () => {
    const { declaration, ...metadata } = eventQueryDataGenerator({
      id: 'seabeast-clad-stad-elia-oleocellosis',
      assignedTo: userId,
      createdBy: userId,
      trackingId: 'B77FF6',
      createdAt: new Date(2000, 1, 1).toISOString(),
      updatedAt: new Date(2000, 1, 2).toISOString(),
      updatedAtLocation: locations[0].id,
      createdAtLocation: locations[0].id,
      updatedBy: userId
    })

    const users = [
      {
        id: userId,
        name: [
          {
            use: 'en',
            given: ['Joseph'],
            family: 'Musonda'
          }
        ],
        role: 'NATIONAL_REGISTRAR'
      }
    ] satisfies User[]

    const stringified = stringifyEventMetadata({
      metadata: { ...metadata, modifiedAt: new Date().toISOString() },
      locations,
      users,
      intl: createIntl({ locale: 'en' })
    })
    expect(stringified).toMatchSnapshot()
  })
})

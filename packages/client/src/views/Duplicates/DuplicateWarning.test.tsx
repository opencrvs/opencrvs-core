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
import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { createDuplicateDetailsQuery } from './utils'
import { createStore } from '@client/store'
import { waitForElement } from '@client/tests/wait-for-element'
import { DuplicateWarning } from './DuplicateWarning'
import { Alert } from '@opencrvs/components/lib/Alert'

const duplicateIds = [
  '450ce5e3-b495-4868-bb6a-1183ffd0fee1',
  '450ce5e3-b495-4868-bb6a-1183ffd0fff1'
]

describe('Review Duplicates component', () => {
  const graphqlMock = [
    {
      request: {
        query: createDuplicateDetailsQuery(duplicateIds),
        variables: {
          duplicate0Id: duplicateIds[0],
          duplicate1Id: duplicateIds[1]
        }
      },
      result: {
        data: {
          duplicate0: {
            registration: {
              trackingId: 'BFCJ02U'
            }
          },
          duplicate1: {
            registration: {
              trackingId: 'BFCJ02U'
            }
          }
        }
      }
    }
  ]

  it('should load the duplicate warning component correctly', async () => {
    const { store, history } = createStore()
    const testComponent = await createTestComponent(
      <DuplicateWarning duplicateIds={duplicateIds} />,
      { store, history, graphqlMocks: graphqlMock }
    )

    const warning = await waitForElement(testComponent, Alert)
    expect(warning).toHaveLength(2)
  })
})

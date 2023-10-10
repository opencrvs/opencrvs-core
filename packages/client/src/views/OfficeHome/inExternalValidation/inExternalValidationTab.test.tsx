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
import { ReactWrapper } from 'enzyme'
import {
  createTestComponent,
  createTestStore,
  resizeWindow
} from '@client/tests/util'
import { InExternalValidationTab } from './InExternalValidationTab'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { checkAuth } from '@client/profile/profileActions'
import type { GQLBirthEventSearchSet } from '@client/utils/gateway-deprecated-do-not-use'
import { waitForElement } from '@client/tests/wait-for-element'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import { History } from 'history'
import { vi, Mock } from 'vitest'

const EVENT_CREATION_TIME = 1583322631424 // Wed Mar 04 2020 13:50:31 GMT+0200 (Eastern European Standard Time)
const SEND_FOR_VALIDATION_TIME = 1582912800000 // Fri Feb 28 2020 20:00:00 GMT+0200 (Eastern European Standard Time)

const registerScopeToken = jwt.sign(
  { scope: ['register'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)
const getItem = window.localStorage.getItem as Mock

const birthEventSearchSet: GQLBirthEventSearchSet = {
  id: '956281c9-1f47-4c26-948a-970dd23c4094',
  type: 'Birth',
  registration: {
    status: 'WAITING_VALIDATION',
    contactNumber: '01622688231',
    trackingId: 'BW0UTHR',
    registrationNumber: undefined,
    eventLocationId: undefined,
    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
    duplicates: [null],
    createdAt: EVENT_CREATION_TIME.toString(),
    modifiedAt: SEND_FOR_VALIDATION_TIME.toString()
  },
  dateOfBirth: '2010-10-10',
  childName: [
    {
      firstNames: 'Iliyas',
      familyName: 'Khan',
      use: 'en'
    },
    {
      firstNames: 'ইলিয়াস',
      familyName: 'খান',
      use: 'bn'
    }
  ]
}

describe('Registrar home external validation tab tests', () => {
  let component: ReactWrapper<{}, {}>
  let history: History<any>

  beforeEach(async () => {
    const SECONDARY_TIME = 1583322631424 // Wed Mar 04 2020 13:50:31 GMT+0200 (Eastern European Standard Time)
    Date.now = vi.fn(() => SECONDARY_TIME)
    const { store: testStore, history: testHistory } = await createTestStore()
    getItem.mockReturnValue(registerScopeToken)
    testStore.dispatch(checkAuth())

    const testComponent = await createTestComponent(
      // @ts-ignore
      <InExternalValidationTab
        queryData={{ data: { totalItems: 1, results: [birthEventSearchSet] } }}
      />,
      { store: testStore, history: testHistory }
    )
    component = testComponent
    history = testHistory
  })

  it('renders data', async () => {
    const tableElement = await waitForElement(component, Workqueue)
    const data = tableElement.prop('content')

    expect(data.length).toBe(1)
    expect(data[0].id).toBe('956281c9-1f47-4c26-948a-970dd23c4094')
    expect(data[0].sentForValidation).toBe('4 days ago')
    expect(data[0].dateOfEvent).toBe('9 years ago')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()
  })

  it('clicking on a row redirect to recordAudit page', async () => {
    const tableElement = await waitForElement(component, Workqueue)
    const dataRow = tableElement.find('#name_0').hostNodes()
    dataRow.simulate('click')
    component.update()
    expect(history.location.pathname).toContain('record-audit')
  })

  describe('On devices with small viewport', () => {
    beforeEach(() => {
      resizeWindow(800, 1280)
      component.update()
    })

    it('clicking on row takes user to details page', async () => {
      const tableElement = await waitForElement(component, Workqueue)
      const dataRow = tableElement.find('#name_0').hostNodes()
      dataRow.simulate('click')
      component.update()
      expect(history.location.pathname).toContain('record-audit')
    })
  })
})

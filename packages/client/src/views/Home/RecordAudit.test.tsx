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

import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'

describe('Record Audit tests', () => {
  const { store } = createStore()
  it('Record Audit page loads properly', async () => {
    const testComponent = await createTestComponent(<RecordAudit />, store)
    expect(
      testComponent.component.find('#recordAudit').hostNodes()
    ).toHaveLength(1)
  })
})

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

import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { SystemList } from '@client/views/SysAdmin/Config/Systems/Systems'
import { describe } from 'vitest'

describe('render system integration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    ;({ component } = await createTestComponent(<SystemList />, {
      store
    }))
  })

  it('Render system integrations properly', async () => {
    expect(component.exists('SystemList')).toBeTruthy()
  })
})

describe('render create system integrations', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    const { component: testComponent } = await createTestComponent(
      <SystemList />,
      {
        store
      }
    )
    component = testComponent
  })

  it('should show the system creation modal after click the create button', async () => {
    component.find('#createClientButton').hostNodes().simulate('click')
    expect(component.exists('ResponsiveModal')).toBeTruthy()
  })
})

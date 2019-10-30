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
import { createShallowRenderedComponent } from '@register/tests/util'
import { ViewHeader } from '@register/components/ViewHeader'

describe('view header component', () => {
  const testComponent = createShallowRenderedComponent(
    <ViewHeader
      id="test_heaader"
      title="Test title"
      description="Test description"
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})

describe('view header component with logo', () => {
  const hideBackButton = true
  const testComponent = createShallowRenderedComponent(
    <ViewHeader
      id="test_heaader"
      title="Test title"
      description="Test description"
      hideBackButton={hideBackButton}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})

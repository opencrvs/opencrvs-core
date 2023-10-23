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
import { createShallowRenderedComponent } from '@client/tests/util'
import { PerformanceSelect } from './PerformanceSelect'

describe('PerformanceSelect tests', () => {
  it('shallow rendered component matches snapshot', () => {
    const shallowPerformanceSelect = createShallowRenderedComponent(
      <PerformanceSelect
        value="OPTION1"
        options={[
          { label: 'Option 1', value: 'OPTION1' },
          { label: 'Option 2', value: 'OPTION2', type: 'TYPE' }
        ]}
      />
    )

    expect(shallowPerformanceSelect).toMatchSnapshot()
  })
})

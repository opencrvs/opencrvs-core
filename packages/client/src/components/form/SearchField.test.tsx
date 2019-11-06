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
import { IntlProvider } from 'react-intl'
import { createShallowRenderedComponent } from '@client/tests/util'
import { SearchField } from './SearchField'

describe('Search Field component', () => {
  const mock = jest.fn()
  const testComponent = createShallowRenderedComponent(
    <IntlProvider locale="en">
      <SearchField
        fieldName="registrationOffice"
        fieldValue=""
        onModalComplete={mock}
        searchableResource="locations"
        searchableType="ADMIN_STRUCTURE"
      />
    </IntlProvider>
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})

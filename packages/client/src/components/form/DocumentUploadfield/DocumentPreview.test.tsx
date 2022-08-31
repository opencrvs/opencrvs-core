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
import { createShallowRenderedComponent } from '@client/tests/util'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { vi } from 'vitest'

describe('image upload component', () => {
  const mock = vi.fn()
  const testComponent = createShallowRenderedComponent(
    <DocumentPreview
      previewImage={{
        optionValues: [],
        type: 'image/png',
        data: 'dummy base64 data'
      }}
      goBack={mock}
      onDelete={mock}
    />
  )

  it('renders without crashing', () => {
    expect(testComponent).toMatchSnapshot()
  })
})

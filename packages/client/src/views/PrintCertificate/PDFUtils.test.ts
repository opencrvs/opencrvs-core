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
import { previewCertificate } from '@client/views/PrintCertificate/PDFUtils'
import {
  mockDeclarationData,
  userDetails,
  mockDeathDeclarationData,
  mockOfflineData
} from '@client/tests/util'
import { createIntl } from 'react-intl'
import { Event } from '@client/utils/gateway'
import { omit, cloneDeep } from 'lodash'

const intl = createIntl({
  locale: 'en'
})

describe('PDFUtils related tests', () => {
  it('Throws exception if invalid userDetails found for previewCertificate', () => {
    const deathDeclaration = omit(mockDeathDeclarationData, 'deathEvent')
    expect(
      previewCertificate(
        intl,
        {
          id: 'asdhdqe2472487jsdfsdf',
          data: deathDeclaration,
          event: Event.Death
        },
        null,
        mockOfflineData,
        (pdf: string) => {}
      )
    ).rejects.toThrowError('No user details found')
  })
})

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
import {
  previewCertificate,
  downloadFile
} from '@client/views/PrintCertificate/PDFUtils'
import { mockDeathDeclarationData, mockOfflineData } from '@client/tests/util'
import { createIntl } from 'react-intl'
import { Event } from '@client/utils/gateway'
import { omit, cloneDeep } from 'lodash'
import { validImageB64String } from '@client/tests/mock-offline-data'

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
  describe('downloadFile functionality', () => {
    const createElementMock = jest.fn()
    const setAttributeMock = jest.fn()
    const onClickMock = jest.fn()
    const anchor = document.createElement('a')
    anchor.setAttribute = setAttributeMock
    anchor.onclick = onClickMock()
    createElementMock.mockReturnValueOnce(anchor)
    document.createElement = createElementMock
    downloadFile('image/svg+xml', validImageB64String, 'test.svg')
    const linkSource = `data:image/svg+xml;base64,${window.btoa(
      validImageB64String
    )}`
    expect(createElementMock).toHaveBeenCalledWith('a')
    expect(setAttributeMock).toHaveBeenCalledWith('href', linkSource)
    expect(onClickMock).toHaveBeenCalled()
  })
})

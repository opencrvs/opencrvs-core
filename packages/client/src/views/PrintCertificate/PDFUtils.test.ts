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
import {
  previewCertificate,
  downloadFile
} from '@client/views/PrintCertificate/PDFUtils'
import {
  createTestStore,
  mockDeathDeclarationData,
  mockOfflineData
} from '@client/tests/util'
import { createIntl } from 'react-intl'
import { Event } from '@client/utils/gateway'
import { omit } from 'lodash'
import { validImageB64String } from '@client/tests/mock-offline-data'
import { vi } from 'vitest'

const intl = createIntl({
  locale: 'en'
})

describe('PDFUtils related tests', () => {
  it('Throws exception if invalid userDetails found for previewCertificate', async () => {
    const deathDeclaration = omit(mockDeathDeclarationData, 'deathEvent')
    const { store } = await createTestStore()
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
        (pdf: string) => {},
        store.getState()
      )
    ).rejects.toThrowError('No user details found')
  })
  it('downloadFile functionality', () => {
    const createElementMock = vi.fn()
    const setAttributeMock = vi.fn()
    const onClickMock = vi.fn()
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

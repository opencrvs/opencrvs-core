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
import { downloadFile } from '@client/views/PrintCertificate/PDFUtils'
import { validImageB64String } from '@client/tests/mock-offline-data'
import { vi } from 'vitest'

describe('PDFUtils related tests', () => {
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

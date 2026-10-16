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

import { FullDocumentPath, isMinioUrl, isS3Url } from './documents'

describe('isS3Url', () => {
  const host = 'https://minio.opencrvs.dev'

  it.each(['jpg', 'jpeg', 'jfif', 'png', 'pdf', 'svg'])(
    'matches a document url with a .%s extension',
    (extension) => {
      expect(isS3Url(`${host}/ocrvs/event-1/document-1.${extension}`)).toBe(
        true
      )
    }
  )

  it('matches a .jfif document url with a query string', () => {
    expect(isS3Url(`${host}/ocrvs/event-1/document-1.jfif?token=abc`)).toBe(
      true
    )
  })

  it('does not match non-document urls', () => {
    expect(isS3Url(`${host}/index.html`)).toBe(false)
    expect(isS3Url(`${host}/ocrvs/event-1/document-1.exe`)).toBe(false)
  })

  it('keeps the deprecated isMinioUrl working for country configs', () => {
    expect(isMinioUrl).toBe(isS3Url)
  })
})

describe('FullDocumentPath', () => {
  it('should transform a path without slash prefix to have slash prefix', () => {
    const result = FullDocumentPath.parse(
      'ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })

  it('should keep slash prefix if already present', () => {
    const result = FullDocumentPath.parse(
      '/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })
})

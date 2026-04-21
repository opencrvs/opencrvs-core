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

import { SignatureField } from './SignatureField'

describe('SignatureField.toCertificateVariables', () => {
  const originalConfig = window.config

  beforeEach(() => {
    window.config = {
      ...originalConfig,
      MINIO_BASE_URL: 'http://localhost:9000'
    }
  })

  afterEach(() => {
    window.config = originalConfig
  })

  it('returns an object with url property when given a valid FileFieldValue', () => {
    const fileValue = {
      path: '/ocrvs/signature-123.png',
      originalFilename: 'signature.png',
      type: 'image/png'
    }

    const result = SignatureField.toCertificateVariables(fileValue)

    expect(result).toEqual({
      url: 'http://localhost:9000/ocrvs/signature-123.png'
    })
  })

  it('returns an empty object when value is undefined', () => {
    const result = SignatureField.toCertificateVariables(undefined)

    expect(result).toEqual({})
  })

  it('returns an empty object when value is null', () => {
    const result = SignatureField.toCertificateVariables(null as any)

    expect(result).toEqual({})
  })

  it('returns an empty object when value is an empty object', () => {
    const result = SignatureField.toCertificateVariables({} as any)

    expect(result).toEqual({})
  })

  it('returns an empty object when value is missing required fields', () => {
    const result = SignatureField.toCertificateVariables({
      originalFilename: 'signature.png'
    } as any)

    expect(result).toEqual({})
  })

  it('correctly resolves Minio URL with different base URLs', () => {
    window.config.MINIO_BASE_URL = 'https://minio.example.com'

    const fileValue = {
      path: '/bucket/signature.png',
      originalFilename: 'signature.png',
      type: 'image/png'
    }

    const result = SignatureField.toCertificateVariables(fileValue)

    expect(result).toEqual({
      url: 'https://minio.example.com/bucket/signature.png'
    })
  })

  it('handles paths without leading slash', () => {
    const fileValue = {
      path: 'ocrvs/signature.png',
      originalFilename: 'signature.png',
      type: 'image/png'
    }

    const result = SignatureField.toCertificateVariables(fileValue)

    expect(result.url).toBe('http://localhost:9000/ocrvs/signature.png')
  })
})

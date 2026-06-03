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

import { DocumentPath } from '@opencrvs/commons/client'
import { SignatureField } from './SignatureField'

describe('SignatureField.toCertificateVariables', () => {
  it('returns an absolute URL string when given a valid FileFieldValue', () => {
    const fileValue = {
      path: '/ocrvs/signature-123.png' as DocumentPath,
      originalFilename: 'signature.png',
      type: 'image/png'
    }

    const result = SignatureField.toCertificateVariables(fileValue)

    expect(result).toBe('/ocrvs/signature-123.png')
  })

  it('returns an empty string when value is undefined', () => {
    const result = SignatureField.toCertificateVariables(undefined)

    expect(result).toBe('')
  })

  it('returns an empty string when value is null', () => {
    // @ts-expect-error testing runtime behaviour with null input
    const result = SignatureField.toCertificateVariables(null)

    expect(result).toBe('')
  })

  it('returns an empty string when value is an empty object', () => {
    // @ts-expect-error testing runtime behaviour with empty object input
    const result = SignatureField.toCertificateVariables({})

    expect(result).toBe('')
  })

  it('returns an empty string when value is missing required fields', () => {
    // @ts-expect-error testing runtime behaviour with missing required fields
    const result = SignatureField.toCertificateVariables({
      originalFilename: 'signature.png'
    })

    expect(result).toBe('')
  })

  it('prepends a leading slash to paths that lack one', () => {
    const fileValue = {
      path: 'ocrvs/signature.png' as DocumentPath,
      originalFilename: 'signature.png',
      type: 'image/png'
    }

    const result = SignatureField.toCertificateVariables(fileValue)

    expect(result).toBe('/ocrvs/signature.png')
  })
})

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
  getBase64String,
  getFileAsTextString,
  validateCertificateTemplate,
  validateImage
} from '@client/utils/imageUtils'

describe('Test base64String function', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.svg', { type: 'image/svg+xml' })
  })

  it('Should return file as base64String', async () => {
    const fileAsBase64 = await getBase64String(file)
    expect(typeof fileAsBase64).toBe('string')
  })
})

describe('Test getFileAsTextString function', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.svg', { type: 'image/svg+xml' })
  })

  it('Should return file as text string', async () => {
    const fileAsTextString = await getFileAsTextString(file)
    expect(fileAsTextString).toBe('(⌐□_□)')
  })
})

describe('Test validateCertificateTemplate function', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.svg', { type: 'image/svg+xml' })
  })

  it('Should return file as text string if file is SVG', async () => {
    const fileAsTextString = await validateCertificateTemplate(file)
    expect(fileAsTextString).toBe('(⌐□_□)')
  })
})

describe('Test validateCertificateTemplate function is file is not SVG', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.jpg', { type: 'image/jpg' })
  })

  it('Should return file as text string if file is SVG', async () => {
    expect(
      async () => await validateCertificateTemplate(file)
    ).rejects.toThrowError('imageType')
  })
})

describe('Test validateImage function if file is JPG/PNG/JPEG', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.jpg', { type: 'image/jpg' })
  })

  it('Should return file as base64 string if file is jpg', async () => {
    const fileAsBase64 = await validateImage(file)
    expect(fileAsBase64).toBe('data:image/jpg;base64,KOKMkOKWoV/ilqEp')
    expect(typeof fileAsBase64).toBe('string')
  })
})

describe('Test validateImage function if file is not JPG/PNG/JPEG', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.svg', { type: 'image/svg+xml' })
  })

  it('Should return error if file is SVG', () => {
    expect(async () => await validateImage(file)).rejects.toThrow()
  })
})

describe('Test validateImage function if file is larger than 5Mb', () => {
  let file: File

  beforeEach(() => {
    file = new File(['(⌐□_□)'], 'certificateSVG.jpg', { type: 'image/jpg' })
    Object.defineProperty(file, 'size', { value: 5242880 + 1 })
  })

  it('Should return error if file greater than 5Mb', () => {
    expect(async () => await validateImage(file)).rejects.toThrow()
  })
})

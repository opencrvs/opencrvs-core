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
  getBase64String,
  getCropWindowSize,
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

describe('Test getCropWindowSize function', () => {
  it('Should return a square window when no target size is configured', () => {
    expect(getCropWindowSize(360)).toEqual({ width: 360, height: 360 })
  })

  it('Should return a square window for a square target size', () => {
    expect(getCropWindowSize(360, { width: 200, height: 200 })).toEqual({
      width: 360,
      height: 360
    })
  })

  it('Should match the aspect ratio of a portrait target size', () => {
    expect(getCropWindowSize(360, { width: 350, height: 450 })).toEqual({
      width: 280,
      height: 360
    })
  })

  it('Should match the aspect ratio of a landscape target size', () => {
    expect(getCropWindowSize(240, { width: 800, height: 400 })).toEqual({
      width: 240,
      height: 120
    })
  })
})

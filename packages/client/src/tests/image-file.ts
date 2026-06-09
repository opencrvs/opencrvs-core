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

/**
 * Creates a synthetic JPEG image `File` of the given dimensions, useful for
 * exercising file-upload flows in Storybook interaction tests.
 */
export async function createImageFile(
  name: string,
  width: number,
  height: number
) {
  return new Promise<File>((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], name, { type: blob.type }))
      } else {
        reject(new Error('Could not create blob from canvas'))
      }
    }, 'image/jpeg')
  })
}

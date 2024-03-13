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
import { Area } from 'react-easy-crop/types'
import {
  ALLOWED_IMAGE_TYPE,
  ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE
} from '@client/utils/constants'

export type IImage = {
  type: string
  data: string
}

export const ERROR_TYPES = {
  IMAGE_TYPE: 'imageType',
  OVERSIZED: 'overSized'
}

export const getBase64String = (file: File) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result)
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

export const getFileAsTextString = (file: File) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result)
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

export const validateImage = async (uploadedImage: File) => {
  if (!ALLOWED_IMAGE_TYPE.includes(uploadedImage.type)) {
    throw new Error(ERROR_TYPES.IMAGE_TYPE)
  }

  if (uploadedImage.size > 5242880) {
    throw new Error(ERROR_TYPES.OVERSIZED)
  }

  const fileAsBase64 = await getBase64String(uploadedImage)

  return fileAsBase64.toString()
}
export const validateCertificateTemplate = async (uploadedImage: File) => {
  if (
    !ALLOWED_IMAGE_TYPE_FOR_CERTIFICATE_TEMPLATE.includes(uploadedImage.type)
  ) {
    throw new Error(ERROR_TYPES.IMAGE_TYPE)
  }
  const fileAsText = await getFileAsTextString(uploadedImage)
  return fileAsText.toString()
}

const createImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = src
  })

export async function getCroppedImage(imageSrc: IImage, croppedArea: Area) {
  const image: HTMLImageElement = await createImage(imageSrc.data)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = image.width
  canvas.height = image.height

  ctx.drawImage(image, 0, 0)

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    croppedArea.x,
    croppedArea.y,
    croppedArea.width,
    croppedArea.height
  )

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = croppedArea.width
  canvas.height = croppedArea.height

  // paste generated image at the top left corner
  ctx.putImageData(data, 0, 0)

  return {
    type: 'image/jpeg',
    data: canvas.toDataURL('image/jpeg')
  }
}

export async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  const mimeType =
    response.headers.get('Content-Type') || 'application/octet-stream'

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const dataUrl = `data:${mimeType};base64,${base64}`
      resolve(dataUrl)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

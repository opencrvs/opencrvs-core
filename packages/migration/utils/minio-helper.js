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

import * as Minio from 'minio'
import uuidPKG from 'uuid'
const { v4: uuid } = uuidPKG
import fileTypePKG from 'file-type'
const { fromBuffer } = fileTypePKG

export const MINIO_HOST = process.env.MINIO_HOST || 'localhost'
export const MINIO_PORT = process.env.MINIO_PORT || 3535
export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'ocrvs'
export const DEFAULT_MINIO_ACCESS_KEY = 'minioadmin'
export const DEFAULT_MINIO_SECRET_KEY = 'minioadmin'

export const minioClient = new Minio.Client({
  endPoint: MINIO_HOST,
  port: Number(MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || DEFAULT_MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY || DEFAULT_MINIO_SECRET_KEY
})

export async function uploadBase64ToMinio(fileData) {
  const ref = uuid()
  try {
    const base64String = fileData.split(',')[1]
    const base64Decoded = Buffer.from(base64String, 'base64')
    const fileType = await fromBuffer(base64Decoded)
    const generateFileName = `${ref}.${fileType.ext}`
    await minioClient.putObject(MINIO_BUCKET, generateFileName, base64Decoded, {
      'content-type': fileType.mime
    })
    return `/${MINIO_BUCKET}/${generateFileName}`
  } catch (error) {
    return error
  }
}

export function isBase64FileString(fileData) {
  if (fileData === '' || fileData.trim() === '') {
    return false
  }
  const strSplit = fileData.split(':')
  return strSplit.length > 0 && strSplit[0] === 'data'
}

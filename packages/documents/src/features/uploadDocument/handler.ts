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
import { minioClient } from '@documents/minio/client'
import { MINIO_BUCKET } from '@documents/minio/constants'
import * as Hapi from '@hapi/hapi'
import { v4 as uuid } from 'uuid'
import { fromBuffer } from 'file-type'
import {
  FullDocumentPath,
  getUserId,
  joinValues,
  logger,
  toDocumentPath
} from '@opencrvs/commons'

import { z } from 'zod'
import { Readable } from 'stream'
import { badRequest, notFound } from '@hapi/boom'
export interface IDocumentPayload {
  fileData: string
  metaData?: Record<string, string>
}

export type IFileInfo = {
  ext: string
  mime: string
}

const HapiSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  headers: z.record(z.string()),
  bytes: z.number().optional()
})

const FileSchema = z
  .custom<Readable & { hapi: z.infer<typeof HapiSchema> }>((val) => {
    return '_readableState' in val && 'hapi' in val
  }, 'Not a readable stream or missing hapi field')
  .refine(
    (val) => HapiSchema.safeParse(val.hapi).success,
    'hapi does not match the required structure'
  )

const Payload = z.object({
  file: FileSchema,
  transactionId: z.string(),
  path: z.string().min(1).optional()
})

/**
 * V2 version of the file upload handler.
 */
export async function fileUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization)
  const payload = await Payload.parseAsync(request.payload).catch((error) => {
    logger.error(error)
    throw badRequest('Invalid payload')
  })

  const { file, transactionId, path } = payload

  const extension = file.hapi.filename.split('.').pop()
  const filename = `${transactionId}.${extension}`

  const filePath = joinValues([path, filename], '/')

  await minioClient.putObject(MINIO_BUCKET, filePath, file, {
    'created-by': userId,
    'content-type': 'application/pdf'
  })

  return `/${MINIO_BUCKET}/${filePath}` as FullDocumentPath
}

export async function fileExistsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // Ensure file is still in the desired format. forwarding url from gateway,
  // '/files/{filePath*}' --> files//ocrvs/filename.jpg and the double slash is removed.
  const filePath = FullDocumentPath.parse(request.params.filePath)

  let stat

  const documentPath = toDocumentPath(filePath)
  try {
    stat = await minioClient.statObject(MINIO_BUCKET, documentPath)
  } catch (error) {
    if (error.code === 'NotFound') {
      return h
        .response(
          `request failed: document ${documentPath} does not exist in bucket ${MINIO_BUCKET}`
        )
        .code(404)
    }

    throw error
  }

  if (!stat) {
    return notFound('File not found')
  }
  return h.response().code(200)
}

export async function documentUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization)
  if (!userId)
    return Promise.reject(
      new Error(
        `request failed: Authorization token is missing or does not contain a valid user ID.`
      )
    )
  const payload = request.payload as IDocumentPayload
  const ref = uuid()
  try {
    const base64String = payload.fileData.split(',')[1]
    const base64Decoded = Buffer.from(base64String, 'base64')
    const fileType = (await fromBuffer(base64Decoded)) as IFileInfo
    const generateFileName = `${ref}.${fileType.ext}`

    await minioClient.putObject(MINIO_BUCKET, generateFileName, base64Decoded, {
      ...payload.metaData,
      'content-type': fileType.mime,
      'created-by': userId
    })

    return h
      .response({ refUrl: `/${MINIO_BUCKET}/${generateFileName}` })
      .code(200)
  } catch (error) {
    return Promise.reject(new Error(`request failed: ${error.message}`))
  }
}

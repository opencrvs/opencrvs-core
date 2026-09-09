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
import {
  DocumentPath,
  getUserId,
  joinUrlPaths,
  logger
} from '@opencrvs/commons'
import { fromBuffer } from 'file-type'
import { v4 as uuid } from 'uuid'

import { badRequest, forbidden } from '@hapi/boom'
import { Readable } from 'stream'
import { z } from 'zod'
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
  headers: z.record(z.string(), z.string()),
  bytes: z.number().optional()
})

const FileSchema = z
  .custom<Readable & { hapi: z.infer<typeof HapiSchema> }>((val) => {
    return (
      typeof val === 'object' &&
      val !== null &&
      '_readableState' in val &&
      'hapi' in val
    )
  }, 'Not a readable stream or missing hapi field')
  .refine(
    (val) => HapiSchema.safeParse(val.hapi).success,
    'hapi does not match the required structure'
  )

const Payload = z.object({
  file: FileSchema,
  transactionId: z.string(),
  path: z.string().optional().default('')
})

/**
 * @returns the object's metadata, or null when it does not exist.
 */
async function statObjectIfExists(documentPath: DocumentPath) {
  try {
    return await minioClient.statObject(MINIO_BUCKET, documentPath)
  } catch (error) {
    if ((error as { code?: string }).code === 'NotFound') {
      return null
    }

    throw error
  }
}

/**
 * V2 version of the file upload handler.
 */
export async function fileUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization as `Bearer ${string}`)
  const payload = await Payload.parseAsync(request.payload).catch((error) => {
    logger.error(error)
    throw badRequest('Invalid payload')
  })
  const { file, transactionId, path } = payload

  const extension = file.hapi.filename.split('.').pop()
  const filename = `${transactionId}.${extension}`
  const filePath = (
    path ? joinUrlPaths(path, filename) : filename
  ) as DocumentPath

  /*
   * The caller chooses the path, so an upload to a key that already exists
   * would replace its contents and take over `created-by` — which then also
   * satisfies the ownership check in deleteDocument. Replacing a file requires
   * the same ownership that deleting one does.
   */
  const existing = await statObjectIfExists(filePath)

  if (existing && existing.metaData['created-by'] !== userId) {
    throw forbidden(
      `request failed: user with id ${userId} does not have permission to replace this document`
    )
  }

  await minioClient.putObject(MINIO_BUCKET, filePath, file, {
    'created-by': userId,
    ...(filename.endsWith('.pdf') && { 'content-type': 'application/pdf' })
  })

  return filePath
}

export async function fileExistsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let filePath = request.params.filePath
  if (filePath.startsWith('/')) {
    filePath = filePath.slice(1)
  }

  if (filePath.startsWith(MINIO_BUCKET)) {
    filePath = filePath.slice(MINIO_BUCKET.length + 1)
  }

  const documentPath = DocumentPath.parse(filePath)

  const stat = await statObjectIfExists(documentPath)

  if (!stat) {
    return h
      .response(
        `request failed: document ${documentPath} does not exist in bucket ${MINIO_BUCKET}`
      )
      .code(404)
  }

  return h.response().code(200)
}

export async function documentUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization as `Bearer ${string}`)
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
    return Promise.reject(
      new Error(`request failed: ${(error as Error).message}`)
    )
  }
}

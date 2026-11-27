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

import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import {
  AttachmentPath,
  DocumentPath,
  joinValues,
  parseDocumentPath
} from '@opencrvs/commons/client'
import { ensureFreshAccessToken } from '@client/utils/authUtils'
import { cacheFile } from '@client/v2-events/cache'
import { resolveTemporaryIdInPath } from '@client/v2-events/features/events/useEvents/temporary-id'
import { queryClient, trpcClient } from '@client/v2-events/trpc'

interface UploadFileParams {
  file: File
  path: AttachmentPath
  meta: {
    transactionId: string
    referenceId: string
  }
}

function getExtension(file: File) {
  return file.name.split('.').pop() ?? ''
}

/**
 * Asks the events service for a presigned URL and uploads the file directly
 * to the object store. The events service checks that the user may upload to
 * `path`, so the URL is requested again on each retry.
 */
async function uploadFile({
  file,
  path,
  meta
}: UploadFileParams): Promise<{ url: DocumentPath }> {
  await ensureFreshAccessToken()
  /*
   * The path is derived from the event id, which is still temporary when the file is
   * attached before the event has synced (e.g. offline). Actions referring to the file
   * are sent with the canonical id, so the file must be stored under it, too.
   */
  const extension = getExtension(file)
  const key = parseDocumentPath(
    `${resolveTemporaryIdInPath(path)}${meta.transactionId}.${extension}`
  )

  const fields = {
    transactionId: meta.transactionId,
    extension,
    // Browsers send this type in a form upload when they do not know the file type
    contentType: file.type || 'application/octet-stream',
    contentLength: file.size
  }

  let upload
  if (key?.kind === 'event') {
    upload = await trpcClient.attachments.presignEventUpload.mutate({
      ...fields,
      eventId: key.eventId
    })
  } else if (key?.kind === 'user') {
    upload = await trpcClient.attachments.presignUserUpload.mutate({
      ...fields,
      userId: key.userId
    })
  } else {
    throw new Error(`Cannot upload a file to ${path}`)
  }

  const response = await fetch(upload.url, {
    method: 'PUT',
    headers: upload.headers,
    body: file
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return { url: upload.path }
}

const UPLOAD_MUTATION_KEY = 'uploadFile'

queryClient.setMutationDefaults([UPLOAD_MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: uploadFile,
  meta: { ignoreOutbox: true }
})

interface Options {
  onSuccess?: (data: {
    originalFilename: string
    type: string
    path: DocumentPath
    id: string
  }) => void
}

export function useFileUpload(
  path: AttachmentPath,
  uniqueIdentifier: string,
  options: Options = {}
) {
  const upload = useMutation({
    mutationFn: async (variables: UploadFileParams) =>
      uploadFile({ ...variables, meta: { ...variables.meta } }),
    mutationKey: [UPLOAD_MUTATION_KEY, uniqueIdentifier],
    onMutate: async ({ file, meta }: UploadFileParams) => {
      const temporaryFilename = `${meta.transactionId}.${getExtension(file)}`
      const filePath = joinValues(
        [path.replace(/\/$/, ''), temporaryFilename],
        '/'
      ) as DocumentPath

      await cacheFile({ url: filePath, file })

      // NOTE: In the long run, client should not reverse-engineer the file path.
      // It should be read from the server response.
      options.onSuccess?.({
        ...file,
        originalFilename: file.name,
        type: file.type,
        path: filePath,
        id: meta.referenceId
      })
    }
  })

  return {
    /**
     * Uploads a file with an optional identifier.
     *
     * @param file - The file to be uploaded.
     * @param referenceId An optional identifier for the file. Allows the caller to track the file when its upload completes.
     */
    uploadFile: (
      file: File,
      referenceId = 'default',
      mutateOptions: Parameters<typeof upload.mutate>[1] = {}
    ) => {
      return upload.mutate(
        {
          file,
          path,
          meta: {
            transactionId: uuid(),
            referenceId
          }
        },
        mutateOptions
      )
    },
    uploadFileAsync: async (
      file: File,
      referenceId = 'default',
      mutateOptions: Parameters<typeof upload.mutate>[1] = {}
    ) => {
      return upload.mutateAsync(
        {
          file,
          path,
          meta: {
            transactionId: uuid(),
            referenceId
          }
        },
        mutateOptions
      )
    }
  }
}

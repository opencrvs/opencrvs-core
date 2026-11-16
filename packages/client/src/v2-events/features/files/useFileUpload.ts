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
  joinValues
} from '@opencrvs/commons/client'
import { ensureFreshAccessToken, getToken } from '@client/utils/authUtils'
import { cacheFile } from '@client/v2-events/cache'
import { resolveTemporaryIdInPath } from '@client/v2-events/features/events/useEvents/temporary-id'
import { queryClient } from '@client/v2-events/trpc'
import { isTemporaryId } from '@client/v2-events/utils'

interface UploadFileParams {
  file: File
  path: AttachmentPath
  meta: {
    transactionId: string
    referenceId: string
  }
}

/**
 * Tells if a path is under the prefix of a user that the server has not created yet.
 *
 * The user editor gives a new user a temporary id (`tmp-<uuid>`). The server cannot
 * store a file under that id, and the stored path must name the real user.
 */
export function isNewUserFilePath(path: string) {
  const [prefix, userId = ''] = path.split('/')
  return prefix === 'users' && isTemporaryId(userId)
}

function getFilePath(
  path: AttachmentPath,
  file: File,
  transactionId: string
): DocumentPath {
  const extension = file.name.split('.').pop()
  return joinValues(
    [path.replace(/\/$/, ''), `${transactionId}.${extension}`],
    '/'
  ) as DocumentPath
}

async function uploadFile({
  file,
  path,
  meta
}: UploadFileParams): Promise<{ url: string }> {
  /*
   * The file of a new user stays in the browser cache. The user editor uploads it
   * after the server creates the user.
   */
  if (isNewUserFilePath(path)) {
    return { url: getFilePath(path, file, meta.transactionId) }
  }

  await ensureFreshAccessToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('transactionId', meta.transactionId)
  /*
   * The path is derived from the event id, which is still temporary when the file is
   * attached before the event has synced (e.g. offline). Actions referring to the file
   * are sent with the canonical id, so the file must be stored under it, too.
   */
  formData.append('path', resolveTemporaryIdInPath(path))

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return { url: await response.text() }
}

/**
 * Uploads a file that is not attached through a form field.
 *
 * @param transactionId gives the file name. An upload with the same transaction id
 * replaces the same file, so a retry does not store a second copy.
 * @returns the path where the server stored the file.
 */
export async function uploadFileToPath(
  file: File,
  path: AttachmentPath,
  transactionId: string
): Promise<DocumentPath> {
  const { url } = await uploadFile({
    file,
    path,
    meta: { transactionId, referenceId: transactionId }
  })

  return url as DocumentPath
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
      const filePath = getFilePath(path, file, meta.transactionId)

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

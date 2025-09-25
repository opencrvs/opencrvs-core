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
import { useParams } from 'react-router-dom'
import {
  DocumentPath,
  FullDocumentPath,
  joinUrlPaths,
  joinValues
} from '@opencrvs/commons/client'
import { getToken } from '@client/utils/authUtils'
import { queryClient } from '@client/v2-events/trpc'
import {
  cacheFile,
  getFullDocumentPath,
  getUnsignedFileUrl,
  removeCached
} from '@client/v2-events/cache'
import { fetchFileFromUrl } from '@client/utils/imageUtils'
import { waitUntilEventIsCreated } from '../events/useEvents/procedures/utils'

interface UploadFileParams {
  file: File
  eventId: string
  meta: {
    transactionId: string
    referenceId: string
  }
}

async function uploadFile({
  file,
  eventId,
  meta
}: UploadFileParams): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('transactionId', meta.transactionId)

  formData.append('path', eventId)

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

  return response
}

/**
 * NOTE: This function is used to delete a file from the server.
 * There are two worrying cases:
 * 1. User deletes a file but does not save the changes when they leave. We try to access the file later and it is not there.
 * 2. Documents service includes "fail-safe" for users other than the creator of the file. If a user tries to delete a file that they do not own, it will fail (silently). Given the above scenario, the file would still be there.
 *
 */
async function deleteFile({ filename }: { filename: string }): Promise<void> {
  const response = await fetch('/api/files/' + filename, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (!response.ok) {
    if (response.status === 403) {
      // eslint-disable-next-line no-console
      console.warn(
        `Unable to hard-delete the file ${filename}. Only the creator can remove it.`
      )
    }

    if (response.status === 404) {
      // eslint-disable-next-line no-console
      console.warn(
        `Unable to hard-delete the file ${filename}. File not found.`
      )
    }

    throw new Error('File deletion failed', { cause: response.status })
  }

  return
}

const UPLOAD_MUTATION_KEY = 'uploadFile'
const DELETE_MUTATION_KEY = 'deleteFile'

async function getPresignedUrl(filePath: FullDocumentPath) {
  const url = joinUrlPaths('/api/presigned-url', filePath)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const res = await response.json()
  return res
}

export async function precacheFile(path: FullDocumentPath) {
  const presignedUrl = (await getPresignedUrl(path)).presignedURL

  const file = await fetchFileFromUrl(presignedUrl, path)

  if (file) {
    const url = getUnsignedFileUrl(path)

    await cacheFile({ url, file })
  }
}

queryClient.setMutationDefaults([DELETE_MUTATION_KEY], {
  // @ts-ignore
  retry: (_, error) => {
    if (error.cause === 403) {
      return false
    }
    if (error.cause === 404) {
      return false
    }

    return true
  },
  retryDelay: 5000,
  mutationFn: deleteFile
})
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
    path: FullDocumentPath
    id: string
  }) => void
}

export function useFileUpload(fieldId: string, options: Options = {}) {
  // Introduce `eventId` to the params to allow uploading files related to a specific event.
  // Main goal is to allow uploading files in the context of an event, which is helpful when we need to clean up orphans.
  // Start with good enough: Components do not need to pass `eventId` explicitly, it is automatically derived from the URL params without forcing low-level components to know about events concept.
  const { eventId } = useParams()

  if (!eventId) {
    throw new Error("`eventId` not found in URL params. Can't upload files")
  }

  const upload = useMutation({
    mutationFn: waitUntilEventIsCreated(async (variables: UploadFileParams) =>
      uploadFile({ ...variables, meta: { ...variables.meta } })
    ),
    mutationKey: [UPLOAD_MUTATION_KEY, fieldId],
    onMutate: async ({ file, meta, eventId: dir }: UploadFileParams) => {
      const extension = file.name.split('.').pop()
      const temporaryFilename = `${meta.transactionId}.${extension}`
      const filePathWithDirectory = joinValues([dir, temporaryFilename], '/')
      const path = getFullDocumentPath(filePathWithDirectory)
      const url = getUnsignedFileUrl(path)
      await cacheFile({ url, file })

      // NOTE: In the long run, client should not reverse-engineer the file path.
      // It should be read from the server response.
      options.onSuccess?.({
        ...file,
        originalFilename: file.name,
        type: file.type,
        path,
        id: meta.referenceId
      })
    }
  })

  const del = useMutation({
    mutationFn: deleteFile,
    mutationKey: [DELETE_MUTATION_KEY, fieldId],
    onSuccess: (data, { filename }) => {
      void removeCached(filename)
    }
  })

  return {
    deleteFile: (filename: string) => {
      return del.mutate({ filename })
    },
    /**
     * Uploads a file with an optional identifier.
     *
     * @param file - The file to be uploaded.
     * @param referenceId An optional identifier for the file. Allows the caller to track the file when its upload completes.
     */
    uploadFile: (file: File, referenceId = 'default') => {
      return upload.mutate({
        file,
        eventId,
        meta: {
          transactionId: uuid(),
          referenceId
        }
      })
    }
  }
}

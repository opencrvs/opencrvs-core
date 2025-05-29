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
import { getToken } from '@client/utils/authUtils'
import { queryClient } from '@client/v2-events/trpc'
import {
  cacheFile,
  getUnsignedFileUrl,
  removeCached
} from '@client/utils/persistence/fileCache'
import { dataUrlToFile } from '@client/utils/imageUtils'
import { joinValues } from '../../utils'

async function uploadFile({
  file,
  transactionId
}: {
  file: File
  transactionId: string
  id: string
}): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('transactionId', transactionId)

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

async function deleteFile({ filename }: { filename: string }): Promise<void> {
  const response = await fetch('/api/files/' + filename, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (!response.ok) {
    throw new Error('File deletation upload failed')
  }

  return
}

const UPLOAD_MUTATION_KEY = 'uploadFile'
const DELETE_MUTATION_KEY = 'deleteFile'

async function getPresignedUrl(fileUri: string) {
  const url = joinValues(['/api/presigned-url', fileUri], '/')

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const res = await response.json()
  return res
}

export async function precacheFile(filename: string) {
  const presignedUrl = (await getPresignedUrl(filename)).presignedURL

  const file = await dataUrlToFile(presignedUrl, filename)
  await cacheFile({ filename, file })
}

queryClient.setMutationDefaults([DELETE_MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: deleteFile
})
queryClient.setMutationDefaults([UPLOAD_MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: uploadFile
})

interface Options {
  onSuccess?: (data: {
    originalFilename: string
    type: string
    filename: string
    id: string
  }) => void
}

export function useFileUpload(fieldId: string, options: Options = {}) {
  const upload = useMutation({
    mutationFn: uploadFile,
    mutationKey: [UPLOAD_MUTATION_KEY, fieldId],
    onMutate: async ({ file, transactionId, id }) => {
      const extension = file.name.split('.').pop()
      const temporaryFilename = `${transactionId}.${extension}`

      await cacheFile({ filename: temporaryFilename, file })

      options.onSuccess?.({
        ...file,
        originalFilename: file.name,
        type: file.type,
        filename: temporaryFilename,
        id
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
    getFullUrl: getUnsignedFileUrl,
    deleteFile: (filename: string) => {
      return del.mutate({ filename })
    },
    /**
     * Uploads a file with an optional identifier.
     *
     * @param file - The file to be uploaded.
     * @param id An optional identifier for the file. Allows the caller to track the file when its upload completes.
     */
    uploadFile: (file: File, id = 'default') => {
      return upload.mutate({
        file,
        transactionId: uuid(),
        id
      })
    }
  }
}

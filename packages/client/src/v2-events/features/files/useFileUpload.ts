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
import { queryClient } from '@client/v2-events/trpc'
import { getToken } from '@client/utils/authUtils'

async function uploadFile({
  file,
  transactionId
}: {
  file: File
  transactionId: string
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

const MUTATION_KEY = 'uploadFile'

/* Must match the one defined src-sw.ts */
const CACHE_NAME = 'workbox-runtime'

function withPostfix(str: string, postfix: string) {
  if (str.endsWith(postfix)) {
    return str
  }

  return str + postfix
}

export function getFullURL(filename: string) {
  const minioURL = window.config.MINIO_URL
  if (minioURL && typeof minioURL === 'string') {
    return new URL(filename, withPostfix(minioURL, '/')).toString()
  }

  throw new Error('MINIO_URL is not defined')
}

async function cacheFile(filename: string, file: File) {
  const temporaryBlob = new Blob([file], { type: file.type })
  const cacheKeys = await caches.keys()

  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)
  return cache.put(
    getFullURL(filename),
    new Response(temporaryBlob, { headers: { 'Content-Type': file.type } })
  )
}

async function removeCached(filename: string) {
  const cacheKeys = await caches.keys()
  const cacheKey = cacheKeys.find((key) => key.startsWith(CACHE_NAME))

  if (!cacheKey) {
    // eslint-disable-next-line no-console
    console.error(
      `Cache ${CACHE_NAME} not found. Is service worker running properly?`
    )
    return
  }

  const cache = await caches.open(cacheKey)
  return cache.delete(getFullURL(filename))
}

queryClient.setMutationDefaults([MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: uploadFile
})

interface Options {
  onSuccess?: (data: { filename: string }) => void
}

export function useFileUpload(fieldId: string, options: Options = {}) {
  const mutation = useMutation({
    mutationFn: uploadFile,
    mutationKey: [MUTATION_KEY, fieldId],
    onMutate: async ({ file, transactionId }) => {
      const extension = file.name.split('.').pop()
      const temporaryUrl = `${transactionId}.${extension}`

      await cacheFile(temporaryUrl, file)

      options.onSuccess?.({ filename: temporaryUrl })
    },
    onSuccess: (data) => {
      void removeCached(data.url)
    }
  })

  return {
    getFullURL,
    uploadFiles: (file: File) => {
      return mutation.mutate({ file, transactionId: uuid() })
    }
  }
}

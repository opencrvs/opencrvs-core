import { getToken } from '@client/utils/authUtils'
import { queryClient } from '@client/v2-events/trpc'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { v4 as uuid } from 'uuid'

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

function getFullURL(filename: string) {
  return `http://localhost:3535/ocrvs/${filename}`
}

async function cacheFile(filename: string, file: File) {
  const temporaryBlob = new Blob([file], { type: file.type })
  const cacheKeys = await caches.keys()
  const cache = await caches.open(
    cacheKeys.find((key) => key.startsWith(CACHE_NAME))!
  )
  return cache.put(
    getFullURL(filename),
    new Response(temporaryBlob, { headers: { 'Content-Type': file.type } })
  )
}

async function removeCached(filename: string) {
  const cacheKeys = await caches.keys()
  const cache = await caches.open(
    cacheKeys.find((key) => key.startsWith(CACHE_NAME))!
  )
  return cache.delete(getFullURL(filename))
}

queryClient.setMutationDefaults([MUTATION_KEY], {
  retry: true,
  retryDelay: 5000,
  mutationFn: uploadFile
})

export function useFileUpload(fieldId: string) {
  const [state, setState] = useState<{ filename: string } | { filename: null }>(
    {
      filename: null
    }
  )

  const mutation = useMutation({
    mutationFn: uploadFile,
    mutationKey: [MUTATION_KEY, fieldId],
    onMutate: async ({ file, transactionId }) => {
      const extension = file.name.split('.').pop()
      const temporaryUrl = `${transactionId}.${extension}`
      await cacheFile(temporaryUrl, file)
      setState({ filename: temporaryUrl })
    },
    onSuccess: (data, _, context) => {
      removeCached(data.url)
    }
  })

  return {
    filename: state.filename,
    getFullURL,
    uploadFiles: (file: File) => {
      setState({ filename: null })
      return mutation.mutate({ file, transactionId: uuid() })
    }
  }
}

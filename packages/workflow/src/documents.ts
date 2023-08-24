import fetch from 'node-fetch'
import { DOCUMENTS_URL } from './constants'
import { IAuthHeader } from '@opencrvs/commons'

const fetchDocuments = async <T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const result = await fetch(`${DOCUMENTS_URL}${suffix}`, {
    method,
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    body
  })
  const res = await result.json()
  return res
}

export async function uploadBase64ToMinio(
  fileData: string,
  authHeader: IAuthHeader
): Promise<string> {
  const docUploadResponse = await fetchDocuments(
    '/upload',
    authHeader,
    'POST',
    JSON.stringify({ fileData: fileData })
  )

  return docUploadResponse.refUrl
}

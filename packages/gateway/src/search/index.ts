import { SEARCH_URL } from '@gateway/constants'
import { Saved, ValidRecord } from '@opencrvs/commons/types'
import fetch from '@gateway/fetch'

export async function getRecordById(
  recordId: string,
  authorizationToken: string
): Promise<Saved<ValidRecord>> {
  const url = new URL(
    `/records/${recordId}?includeHistoryResources`,
    SEARCH_URL
  )

  const res = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationToken
    }
  })

  return res.json()
}

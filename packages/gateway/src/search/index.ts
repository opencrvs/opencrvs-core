import { SEARCH_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { Bundle, Saved } from '@opencrvs/commons/types'

export async function getRecordById(
  recordId: string,
  authorizationToken: string
): Promise<Saved<Bundle>> {
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

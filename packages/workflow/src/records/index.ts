import { StateIdenfitiers } from '@opencrvs/commons/types'
import { SEARCH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export async function getRecordById<T extends Array<keyof StateIdenfitiers>>(
  recordId: string,
  authorizationToken: string,
  allowedStates: T
): Promise<StateIdenfitiers[T[number]]> {
  const url = new URL(`/records/${recordId}`, SEARCH_URL)
  url.searchParams.append('states', allowedStates.join(','))

  const res = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationToken
    }
  })

  return res.json()
}

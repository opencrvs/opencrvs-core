import { IAuthHeader } from '@opencrvs/commons'
import { getTokenPayload } from './features/user/utils'
import { SEARCH_URL } from './constants'

import fetch from '@gateway/fetch'

export async function postAssignmentSearch(
  authHeader: IAuthHeader,
  compositionId: string
) {
  return fetch(`${SEARCH_URL}search/assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify({ compositionId })
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Search assignment failed: ${error.message}`)
      )
    })
}

export async function checkUserAssignment(
  id: string,
  authHeader: IAuthHeader
): Promise<boolean> {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const res: { userId?: string } = await postAssignmentSearch(authHeader, id)

  return userId === res?.userId
}

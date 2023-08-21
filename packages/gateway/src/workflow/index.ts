import { IAuthHeader } from '@gateway/common-types'
import { WORKFLOW_URL } from '@gateway/constants'
import { GQLCorrectionInput } from '@gateway/graphql/schema'
import fetch from 'node-fetch'

const createRequest = async <T = any>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  path: string,
  authHeader: IAuthHeader,
  body: Record<string, any>
): Promise<T> => {
  const response = await fetch(new URL(path, WORKFLOW_URL).href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    if (response.status === 400) {
      const data = await response.json()
      throw new Error(data.message)
    }

    throw new Error(response.statusText)
  }

  return response.json()
}

export function requestBirthRegistrationCorrection(
  recordId: string,
  correctionDetails: GQLCorrectionInput,
  authHeader: IAuthHeader
) {
  return createRequest(
    'POST',
    `/records/${recordId}/request-correction`,
    authHeader,
    correctionDetails
  )
}

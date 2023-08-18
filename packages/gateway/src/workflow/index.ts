import { IAuthHeader } from '@gateway/common-types'
import { WORKFLOW_URL } from '@gateway/constants'
import { GQLCorrectionRequestInput } from '@gateway/graphql/schema'

const createRequest = <T = any>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  path: string,
  authHeader: IAuthHeader,
  body: Record<string, any>
): Promise<T> => {
  return fetch(new URL(path, WORKFLOW_URL).href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(body)
  }).then((response) => {
    return response.json()
  })
}

export function requestBirthRegistrationCorrection(
  recordId: string,
  correctionDetails: GQLCorrectionRequestInput,
  authHeader: IAuthHeader
) {
  return createRequest(
    'POST',
    `/records/${recordId}/request-correction`,
    authHeader,
    correctionDetails
  )
}

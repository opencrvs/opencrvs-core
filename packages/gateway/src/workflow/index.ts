import { IAuthHeader } from '@opencrvs/commons'
import { WORKFLOW_URL } from '@gateway/constants'
import {
  GQLCorrectionInput,
  GQLCorrectionRejectionInput
} from '@gateway/graphql/schema'
import fetch from '@gateway/fetch'
import { Bundle } from '@opencrvs/commons/types'

const createRequest = async <T = any>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  path: string,
  authHeader: IAuthHeader,
  body?: Record<string, any>
): Promise<T> => {
  const response = await fetch(new URL(path, WORKFLOW_URL).href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: body ? JSON.stringify(body) : undefined
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

export function requestRegistrationCorrection(
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

export function approveRegistrationCorrection(
  recordId: string,
  correctionDetails: GQLCorrectionInput,
  authHeader: IAuthHeader
) {
  return createRequest(
    'POST',
    `/records/${recordId}/approve-correction`,
    authHeader,
    correctionDetails
  )
}

export function makeRegistrationCorrection(
  recordId: string,
  correctionDetails: GQLCorrectionInput,
  authHeader: IAuthHeader
) {
  return createRequest<Bundle>(
    'POST',
    `/records/${recordId}/make-correction`,
    authHeader,
    correctionDetails
  )
}

export function rejectRegistrationCorrection(
  recordId: string,
  details: GQLCorrectionRejectionInput,
  authHeader: IAuthHeader
) {
  return createRequest(
    'POST',
    `/records/${recordId}/reject-correction`,
    authHeader,
    details
  )
}

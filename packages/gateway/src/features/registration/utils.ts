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

import { IAuthHeader } from '@opencrvs/commons'
import { fetchDocuments } from '@gateway/features/documents/service'
import { getTokenPayload, getUser } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'
import { PractitionerRole, Resource } from '@opencrvs/commons/types'

export async function getPresignedUrlFromUri(
  fileUri: string,
  authHeader: IAuthHeader
) {
  const response = (await fetchDocuments(
    '/presigned-url',
    authHeader,
    'POST',
    JSON.stringify({ fileUri })
  )) as { presignedURL: string }

  return response.presignedURL
}

export async function setCollectorForPrintInAdvance(
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const userDetails = await getUser({ userId }, authHeader)
  const name = userDetails.name.map((nameItem) => ({
    use: nameItem.use,
    familyName: nameItem.family,
    firstNames: nameItem.given.join(' ')
  }))
  const role = userDetails.role.labels.find(({ lang }) => lang === 'en')?.label

  details?.registration?.certificates?.forEach((certificate) => {
    if (!certificate) return
    if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE') {
      certificate.collector = {
        name,
        relationship: 'PRINT_IN_ADVANCE',
        otherRelationship: role,
        identifier: []
      }
    }
    return certificate
  })

  return details
}

export type IPractitionerRoleHistory = (Resource & PractitionerRole)[]
export const getUserRoleFromHistory = (
  practitionerRoleHistory: IPractitionerRoleHistory,
  lastModified: string
) => {
  const practitionerRoleHistorySorted = practitionerRoleHistory.sort((a, b) => {
    if (a.meta?.lastUpdated === b.meta?.lastUpdated) {
      return 0
    }
    if (a.meta?.lastUpdated === undefined) {
      return 1
    }
    if (b.meta?.lastUpdated === undefined) {
      return -1
    }
    return (
      new Date(b.meta?.lastUpdated).valueOf() -
      new Date(a.meta?.lastUpdated).valueOf()
    )
  })

  const result = practitionerRoleHistorySorted.find(
    (it) =>
      it?.meta?.lastUpdated &&
      lastModified &&
      it?.meta?.lastUpdated <= lastModified!
  )

  const targetCode = result?.code?.find((element) => {
    return element.coding?.[0].system === 'http://opencrvs.org/specs/types'
  })

  const role = targetCode?.coding?.[0].code
  const systemRole = result?.code?.[0].coding?.[0].code

  return { role, systemRole }
}

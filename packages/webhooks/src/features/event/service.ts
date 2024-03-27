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

import * as crypto from 'crypto'
import {
  RegisteredRecord,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  ATTACHMENT_DOCS_CODE,
  INFORMANT_CODE,
  DECEASED_CODE,
  DEATH_ENCOUNTER_CODE,
  getComposition,
  CompositionSectionCode,
  resourceIdentifierToUUID,
  isTask
} from '@opencrvs/commons/types'

const NATIONAL_ID_BIRTH_PERMISSIONS = [
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  ATTACHMENT_DOCS_CODE,
  INFORMANT_CODE
] as CompositionSectionCode[]

const NATIONAL_ID_DEATH_PERMISSIONS = [
  DECEASED_CODE,
  ATTACHMENT_DOCS_CODE,
  INFORMANT_CODE,
  DEATH_ENCOUNTER_CODE
] as CompositionSectionCode[]

export function createRequestSignature(
  requestSigningVersion: string,
  signingSecret: string,
  rawBody: string
) {
  const hmac = crypto.createHmac(requestSigningVersion, signingSecret)
  hmac.update(`${requestSigningVersion}:${encodeURIComponent(rawBody)}`)
  return `${requestSigningVersion}=${hmac.digest('hex')}`
}

export function transformBirthBundle(
  bundle: RegisteredRecord,
  scope: string,
  permissions: CompositionSectionCode[] = []
) {
  switch (scope) {
    case 'nationalId':
      return getPermissionsBundle(bundle, NATIONAL_ID_BIRTH_PERMISSIONS)
    case 'webhook':
      return getPermissionsBundle(bundle, permissions)
    default:
      return bundle
  }
}

export function transformDeathBundle(
  bundle: RegisteredRecord,
  scope: string,
  permissions: CompositionSectionCode[] = []
) {
  switch (scope) {
    case 'nationalId':
      return getPermissionsBundle(bundle, NATIONAL_ID_DEATH_PERMISSIONS)
    case 'webhook':
      return getPermissionsBundle(bundle, permissions)
    default:
      return bundle
  }
}

export const getPermissionsBundle = (
  bundle: RegisteredRecord,
  permissions: CompositionSectionCode[]
) => {
  const composition = getComposition(bundle)
  const allowedSections = composition.section.filter((section) =>
    section.code.coding.some(({ code }) => permissions.includes(code))
  )
  const allowedReferences = allowedSections.flatMap((section) =>
    section.entry.map(({ reference }) => resourceIdentifierToUUID(reference))
  )

  return {
    ...bundle,
    entry: bundle.entry.filter(
      ({ resource }) =>
        allowedReferences.includes(resource.id) || isTask(resource)
    )
  } satisfies RegisteredRecord
}

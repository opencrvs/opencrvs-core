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
  getComposition,
  CompositionSectionCode,
  resourceIdentifierToUUID,
  isTask
} from '@opencrvs/commons/types'

export function createRequestSignature(
  requestSigningVersion: string,
  signingSecret: string,
  rawBody: string
) {
  const hmac = crypto.createHmac(requestSigningVersion, signingSecret)
  hmac.update(`${requestSigningVersion}:${encodeURIComponent(rawBody)}`)
  return `${requestSigningVersion}=${hmac.digest('hex')}`
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

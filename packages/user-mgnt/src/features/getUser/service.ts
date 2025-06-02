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

import {
  Extension,
  findExtension,
  OPENCRVS_SPECIFICATION_URL
} from '@opencrvs/commons/types'
import { getFromFhir } from '../createUser/service'

/**
 * Users can have a signature extension that contains the storage key to their signature image.
 *
 * @returns storage key in /:bucketName/:objectName format.  e.g. /ocrvs/123123123123.png
 */
function findSignatureStorageKey(extensions: Extension[] | undefined) {
  const signature = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
    extensions || []
  )

  return signature?.valueAttachment.url
}

export async function getPractitionerSignature(
  token: string,
  practitionerId: string
) {
  const practitioner = await getFromFhir(
    token,
    `/Practitioner/${practitionerId}`
  )

  return findSignatureStorageKey(practitioner.extension)
}

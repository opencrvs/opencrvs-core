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
import * as Hapi from '@hapi/hapi'
import { logger } from '@search/logger'
import { internal } from '@hapi/boom'
import { removeDuplicate } from '@search/features/registration/deduplicate/service'
import { client } from '@search/elasticsearch/client'

export async function deduplicateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = request.payload as fhir.Bundle
    const composition = payload.entry?.find(
      (e) => e.resource?.resourceType === 'Composition'
    )

    await removeDuplicate(
      composition?.resource as fhir.Composition & { id: string },
      client
    )
  } catch (error) {
    logger.error(`Search/searchDeclarationHandler: error: ${error}`)
    return internal(error)
  }
  return h.response().code(200)
}

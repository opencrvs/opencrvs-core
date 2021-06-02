/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  searchByCompositionId,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import { ICompositionBody } from '@search/elasticsearch/utils'
import { get } from 'lodash'

export const removeDuplicate = async (bundle: fhir.Bundle) => {
  const compositionId = bundle.id

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }
  const composition = await searchByCompositionId(compositionId)
  const body = get(composition, 'body.hits.hits[0]._source') as ICompositionBody
  body.relatesTo = extractRelatesToIDs(bundle)
  await updateComposition(compositionId, body)
}

const extractRelatesToIDs = (bundle: fhir.Bundle) => {
  const relatesToBundle = get(bundle, 'relatesTo') || []

  return relatesToBundle.map(
    (item: { targetReference: { reference: String } }) =>
      item.targetReference.reference.replace('Composition/', '')
  )
}

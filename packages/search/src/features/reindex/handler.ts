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
import { updateAliases } from '@search/features/reindex/alias-indices'
import { reindex } from './reindex'

export async function reindexHandler(
  _request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  /*
   * Don't wait for reindex & updateAliases as it can take a while
   */
  process.nextTick(async () => {
    await reindex()
    await updateAliases()
  })

  return h
    .response({
      status: 'accepted',
      message:
        'ElasticSearch reindexing process has been initiated and is running in the background. See the search service logs.'
    })
    .code(202)
}

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
import * as Hapi from 'hapi'
import { logger } from '@search/logger'
import { internal } from 'boom'
import { searchComposition } from '@search/features/search/service'
import { ISearchQuery } from '@search/features/search/types'
import { client } from '@search/elasticsearch/client'

export async function searchDeclaration(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const result = await searchComposition(request.payload as ISearchQuery)
    return h.response(result).code(200)
  } catch (error) {
    logger.error(`Search/searchDeclarationHandler: error: ${error}`)
    return internal(error)
  }
}

export async function getAllDocumentsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const allDocuments = await client.search(
      {
        index: 'ocrvs',
        body: {
          query: { match_all: {} },
          sort: [{ dateOfApplication: 'asc' }]
        }
      },
      {
        ignore: [404]
      }
    )
    return h.response(allDocuments).code(200)
  } catch (err) {
    return internal(err)
  }
}

interface ICountQueryParam {
  applicationLocationHirarchyId: string
  status: string[]
}

export async function getStatusWiseRegistrationCount(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = request.payload as ICountQueryParam
    const countResult: { status: string; count: number }[] = []
    for (const regStatus of payload.status) {
      const searchResult = await searchComposition({
        applicationLocationHirarchyId: payload.applicationLocationHirarchyId,
        status: [regStatus]
      })
      countResult.push({
        status: regStatus,
        count: searchResult?.body?.hits?.total || 0
      })
    }
    return h.response(countResult).code(200)
  } catch (err) {
    return internal(err)
  }
}

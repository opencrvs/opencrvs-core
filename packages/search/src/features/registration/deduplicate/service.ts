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
import {
  IBirthCompositionBody,
  ICompositionBody
} from '@search/elasticsearch/utils'

import { get } from 'lodash'
import { ISearchResponse } from '@search/elasticsearch/client'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { logger } from '@search/logger'
import { subYears, addYears } from 'date-fns'
import * as elasticsearch from '@elastic/elasticsearch'

export const removeDuplicate = async (
  bundle: fhir.Bundle,
  client: elasticsearch.Client
) => {
  const compositionId = bundle.id

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }
  const composition = await searchByCompositionId(compositionId, client)
  const body = get(composition, 'body.hits.hits[0]._source') as ICompositionBody
  body.relatesTo = extractRelatesToIDs(bundle)
  await updateComposition(compositionId, body, client)
}

const extractRelatesToIDs = (bundle: fhir.Bundle) => {
  const relatesToBundle = get(bundle, 'relatesTo') || []

  return relatesToBundle.map(
    (item: { targetReference: { reference: string } }) =>
      item.targetReference.reference.replace('Composition/', '')
  )
}

/**
 * @author
 * @kind module
 * @description search for duplicate birth declarations
 * @param { IBirthCompositionBody } body -  Params
 * @param client
 * @returns { Promise<ApiResponse<ISearchResponse<IBirthCompositionBody>, Context>> } -  Promise
 * **/
export const searchForDuplicates = async (
  body: IBirthCompositionBody,
  client: elasticsearch.Client
) => {
  // Names of length of 3 or less characters = 0 edits allowed
  // Names of length of 4 - 6 characters = 1 edit allowed
  // Names of length of >7 characters = 2 edits allowed
  const FIRST_NAME_FUZZINESS = 'AUTO:4,7'

  const mothersDetailsMatch = {
    bool: {
      must: [
        // If mother identifier is provided, it needs to match 100%
        body.motherIdentifier && {
          match_phrase: {
            motherIdentifier: body.motherIdentifier
          }
        },
        body.motherFirstNames && {
          match: {
            motherFirstNames: {
              query: body.motherFirstNames,
              fuzziness: FIRST_NAME_FUZZINESS
            }
          }
        },
        body.motherFamilyName && {
          match: {
            motherFamilyName: {
              query: body.motherFamilyName,
              fuzziness: FIRST_NAME_FUZZINESS,
              minimum_should_match: '100%'
            }
          }
        },
        body.motherDoB && {
          range: {
            motherDoB: {
              gte: subYears(new Date(body.motherDoB), 1).toISOString(),
              lte: addYears(new Date(body.motherDoB), 1).toISOString()
            }
          }
        },
        body.motherDoB && {
          distance_feature: {
            field: 'motherDoB',
            pivot: '365d',
            origin: new Date(body.motherDoB).toISOString(),
            boost: 1.5
          }
        }
      ].filter(Boolean)
    }
  }

  const birthWithin9Months = {
    bool: {
      must: [
        body.childDoB && {
          range: {
            childDoB: {
              gte: subYears(new Date(body.childDoB), 1).toISOString(),
              lte: addYears(new Date(body.childDoB), 1).toISOString()
            }
          }
        },
        body.childDoB && {
          distance_feature: {
            field: 'childDoB',
            pivot: '365d',
            origin: new Date(body.childDoB).toISOString(),
            boost: 1
          }
        }
      ].filter(Boolean)
    }
  }

  try {
    const result = await client.search<ISearchResponse<IBirthCompositionBody>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          bool: {
            should: [
              {
                bool: {
                  must: [mothersDetailsMatch, birthWithin9Months]
                }
              },
              {
                bool: {
                  must: [
                    {
                      bool: {
                        must: [
                          body.childFirstNames && {
                            match: {
                              childFirstNames: {
                                query: body.childFirstNames,
                                fuzziness: FIRST_NAME_FUZZINESS
                              }
                            }
                          },
                          body.childFamilyName && {
                            match: {
                              childFamilyName: {
                                query: body.childFamilyName,
                                fuzziness: FIRST_NAME_FUZZINESS,
                                minimum_should_match: '100%'
                              }
                            }
                          }
                        ].filter(Boolean)
                      }
                    },
                    body.childDoB && {
                      bool: {
                        should: [
                          {
                            bool: {
                              must: [
                                {
                                  range: {
                                    childDoB: {
                                      gte: subYears(
                                        new Date(body.childDoB),
                                        1
                                      ).toISOString(),
                                      lte: addYears(
                                        new Date(body.childDoB),
                                        1
                                      ).toISOString()
                                    }
                                  }
                                },
                                {
                                  distance_feature: {
                                    field: 'childDoB',
                                    pivot: '365d',
                                    origin: new Date(
                                      body.childDoB
                                    ).toISOString(),
                                    boost: 1
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    },
                    mothersDetailsMatch
                  ].filter(Boolean)
                }
              }
            ]
          }
        }
      }
    })
    return result.body.hits.hits
  } catch (err) {
    logger.error(`searchDuplicates error: ${err}`)
    throw err
  }
}

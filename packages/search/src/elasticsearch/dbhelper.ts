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
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client, ISearchResponse } from '@search/elasticsearch/client'
import {
  IBirthCompositionBody,
  ICompositionBody
} from '@search/elasticsearch/utils'
import { subYears, addYears } from 'date-fns'
import { logger } from '@search/logger'

export const indexComposition = async (
  compositionIdentifier: string,
  body: ICompositionBody
) => {
  let response: any
  try {
    response = await client.index({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      id: compositionIdentifier,
      body,
      refresh: 'wait_for' // makes the call wait until the change is available via search
    })
  } catch (e) {
    logger.error(`indexComposition: error: ${e}`)
  }

  return response
}

export const updateComposition = async (id: string, body: ICompositionBody) => {
  let response: any
  try {
    response = await client.update({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      id,
      body: {
        doc: body
      },
      refresh: 'wait_for' // makes the call wait until the change is available via search
    })
  } catch (e) {
    logger.error(`updateComposition: error: ${e}`)
  }

  return response
}

export const searchForDuplicates = async (body: IBirthCompositionBody) => {
  try {
    return await client.search<ISearchResponse<IBirthCompositionBody>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  must: [
                    body.childFirstNames && {
                      match: {
                        childFirstNames: {
                          query: body.childFirstNames,
                          fuzziness: 'AUTO:4,7'
                        }
                      }
                    },
                    body.childFamilyName && {
                      match: {
                        childFamilyName: {
                          query: body.childFamilyName,
                          fuzziness: 'AUTO:4,7',
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
                              origin: new Date(body.childDoB).toISOString(),
                              boost: 1
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    body.motherFirstNames && {
                      match: {
                        motherFirstNames: {
                          query: body.motherFirstNames,
                          fuzziness: 'AUTO:4,7'
                        }
                      }
                    },
                    body.motherFamilyName && {
                      match: {
                        motherFamilyName: {
                          query: body.motherFamilyName,
                          fuzziness: 'AUTO:4,7',
                          minimum_should_match: '100%'
                        }
                      }
                    }
                  ].filter(Boolean)
                }
              },
              body.motherDoB && {
                bool: {
                  should: [
                    {
                      bool: {
                        must: [
                          {
                            range: {
                              motherDoB: {
                                gte: subYears(
                                  new Date(body.motherDoB),
                                  1
                                ).toISOString(),
                                lte: addYears(
                                  new Date(body.motherDoB),
                                  1
                                ).toISOString()
                              }
                            }
                          },
                          {
                            distance_feature: {
                              field: 'motherDoB',
                              pivot: '365d',
                              origin: new Date(body.motherDoB).toISOString(),
                              boost: 1.5
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ].filter(Boolean)
          }
        }
      }
    })
  } catch (err) {
    logger.error(`searchDuplicates error: ${err}`)
    throw err
  }
}

export const searchByCompositionId = async (compositionId: string) => {
  try {
    const response = await client.search<ISearchResponse<any>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          match: {
            _id: compositionId
          }
        }
      }
    })
    return response
  } catch (err) {
    logger.error(`searchByCompositionId: error: ${err}`)
    return null
  }
}

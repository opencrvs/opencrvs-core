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
  searchByCompositionId,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import {
  IBirthCompositionBody,
  ICompositionBody,
  IDeathCompositionBody
} from '@search/elasticsearch/utils'
import { get } from 'lodash'
import { ISearchResponse } from '@search/elasticsearch/client'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { logger } from '@search/logger'
import {
  subYears,
  addYears,
  subMonths,
  addMonths,
  subDays,
  addDays
} from 'date-fns'
import * as elasticsearch from '@elastic/elasticsearch'

export const removeDuplicate = async (
  bundle: fhir.Composition & { id: string },
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

const extractRelatesToIDs = (bundle: fhir.Composition & { id: string }) => {
  const relatesToBundle = get(bundle, 'relatesTo') || []

  return relatesToBundle.map(
    (item) => item.targetReference?.reference?.replace('Composition/', '') ?? ''
  )
}

export const searchForBirthDuplicates = async (
  body: IBirthCompositionBody,
  client: elasticsearch.Client
) => {
  // Names of length of 3 or less characters = 0 edits allowed
  // Names of length of 4 - 6 characters = 1 edit allowed
  // Names of length of >7 characters = 2 edits allowed
  const FIRST_NAME_FUZZINESS = 'AUTO:4,7'

  if (
    (!body.childFirstNames && !body.childFamilyName) ||
    (!body.motherFirstNames && !body.motherFamilyName) ||
    !body.motherDoB ||
    !body.childDoB
  ) {
    return []
  }
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
              gte: subMonths(new Date(body.childDoB), 9).toISOString(),
              lte: addMonths(new Date(body.childDoB), 9).toISOString()
            }
          }
        },
        body.childDoB && {
          distance_feature: {
            field: 'childDoB',
            pivot: '273d', // 9 months in days
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
                                        3
                                      ).toISOString(),
                                      lte: addYears(
                                        new Date(body.childDoB),
                                        3
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
    logger.error(`searchBirthDuplicates error: ${err}`)
    throw err
  }
}

export const searchForDeathDuplicates = async (
  body: IDeathCompositionBody,
  client: elasticsearch.Client
) => {
  const FIRST_NAME_FUZZINESS = 'AUTO:4,7'
  if (
    (!body.deceasedFirstNames && !body.deceasedFamilyName) ||
    !body.deceasedDoB ||
    !body.deathDate
  ) {
    return []
  }

  try {
    const result = await client.search<ISearchResponse<IDeathCompositionBody>>({
      index: OPENCRVS_INDEX_NAME,
      type: 'compositions',
      body: {
        query: {
          bool: {
            must: [
              body.deceasedFirstNames && {
                match: {
                  deceasedFirstNames: {
                    query: body.deceasedFirstNames,
                    fuzziness: FIRST_NAME_FUZZINESS
                  }
                }
              },
              body.deceasedFamilyName && {
                match: {
                  deceasedFamilyName: {
                    query: body.deceasedFamilyName,
                    fuzziness: FIRST_NAME_FUZZINESS
                  }
                }
              },
              body.deceasedIdentifier && {
                match_phrase: {
                  deceasedIdentifier: body.deceasedIdentifier
                }
              },
              {
                bool: {
                  must: [
                    body.deathDate && {
                      range: {
                        deathDate: {
                          gte: subDays(
                            new Date(body.deathDate),
                            5
                          ).toISOString(),
                          lte: addDays(
                            new Date(body.deathDate),
                            5
                          ).toISOString()
                        }
                      }
                    },
                    body.deathDate && {
                      distance_feature: {
                        field: 'deathDate',
                        pivot: '5d', // 5 days
                        origin: new Date(body.deathDate).toISOString(),
                        boost: 1
                      }
                    }
                  ].filter(Boolean)
                }
              },
              {
                bool: {
                  must: [
                    body.deceasedDoB && {
                      range: {
                        deceasedDoB: {
                          gte: subDays(
                            new Date(body.deceasedDoB),
                            5
                          ).toISOString(),
                          lte: addDays(
                            new Date(body.deceasedDoB),
                            5
                          ).toISOString()
                        }
                      }
                    },
                    body.deceasedDoB && {
                      distance_feature: {
                        field: 'deceasedDoB',
                        pivot: '5d', // 5 days
                        origin: new Date(body.deceasedDoB).toISOString(),
                        boost: 1
                      }
                    }
                  ].filter(Boolean)
                }
              }
            ].filter(Boolean)
          }
        }
      }
    })
    return result.body.hits.hits
  } catch (err) {
    logger.error(`searchDeathDuplicates error: ${err}`)
    throw err
  }
}

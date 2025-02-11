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
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const bulkOps = [
        {
          $match: {
            'extension.url': {
              $ne: 'http://opencrvs.org/specs/extension/certificateTemplateId'
            }
          }
        },
        {
          $set: {
            certType: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$type.coding',
                    as: 'coding',
                    cond: {
                      $regexMatch: {
                        input: '$$coding.system',
                        regex: /certificate-type/
                      }
                    }
                  }
                },
                0
              ]
            }
          }
        },
        {
          $set: {
            certificateTemplateId: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$certType.code', 'BIRTH'] },
                    then: 'birth-certificate'
                  },
                  {
                    case: { $eq: ['$certType.code', 'DEATH'] },
                    then: 'death-certificate'
                  },
                  {
                    case: { $eq: ['$certType.code', 'MARRIAGE'] },
                    then: 'marriage-certificate'
                  }
                ],
                default: null
              }
            }
          }
        },
        {
          $match: {
            certificateTemplateId: { $ne: null }
          }
        },
        {
          $set: {
            extension: {
              $concatArrays: [
                '$extension',
                [
                  {
                    url: 'http://opencrvs.org/specs/extension/certificateTemplateId',
                    valueString: '$certificateTemplateId'
                  }
                ]
              ]
            }
          }
        },
        {
          $unset: ['certType', 'certificateTemplateId']
        },
        {
          $merge: {
            into: 'DocumentReference',
            whenMatched: 'replace'
          }
        }
      ]

      await db.collection('DocumentReference').aggregate(bulkOps).toArray()
    })
  } catch (error) {
    console.error('Error occurred while updating document references:', error)
    throw error
  } finally {
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const bulkOps = [
        {
          $match: {
            extension: {
              $elemMatch: {
                url: 'http://opencrvs.org/specs/extension/certificateTemplateId'
              }
            }
          }
        },
        {
          $set: {
            extension: {
              $filter: {
                input: '$extension',
                as: 'ext',
                cond: {
                  $ne: [
                    '$$ext.url',
                    'http://opencrvs.org/specs/extension/certificateTemplateId'
                  ]
                }
              }
            }
          }
        },
        {
          $merge: {
            into: 'DocumentReference',
            whenMatched: 'merge',
            whenNotMatched: 'discard'
          }
        }
      ]
      await db.collection('DocumentReference').aggregate(bulkOps).toArray()
      console.log('Reverted certificateTemplateId extension from all documents')
    })
  } catch (error) {
    console.error('Error occurred while reverting document references:', error)
    throw error
  } finally {
    session.endSession()
  }
}

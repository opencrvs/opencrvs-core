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

const DASHBOARD_MONGO_URL =
  process.env.DASHBOARD_MONGO_URL || 'mongodb://localhost/performance'

export const up = async (db: Db, client: MongoClient) => {
  const dashboardDb = (
    await new MongoClient(DASHBOARD_MONGO_URL).connect()
  ).db()
  await db
    .collection('Task')
    .aggregate([
      {
        $unionWith: 'Task_history'
      },
      {
        $match: {
          'extension.url': 'http://opencrvs.org/specs/extension/makeCorrection'
        }
      },
      {
        $addFields: {
          compositionId: {
            $arrayElemAt: [{ $split: ['$focus.reference', '/'] }, 1]
          },
          extensionsObject: {
            $arrayToObject: {
              $map: {
                input: '$extension',
                as: 'el',
                in: [
                  {
                    $replaceOne: {
                      input: '$$el.url',
                      find: 'http://opencrvs.org/specs/extension/',
                      replacement: ''
                    }
                  },
                  {
                    $arrayElemAt: [
                      { $split: ['$$el.valueReference.reference', '/'] },
                      1
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'Composition',
          localField: 'compositionId',
          foreignField: 'id',
          as: 'composition'
        }
      },
      { $unwind: '$composition' },
      {
        $addFields: {
          extensions: {
            $arrayToObject: {
              $map: {
                input: '$composition.section',
                as: 'el',
                in: [
                  {
                    $let: {
                      vars: {
                        firstElement: {
                          $arrayElemAt: ['$$el.code.coding', 0]
                        }
                      },
                      in: '$$firstElement.code'
                    }
                  },
                  {
                    $let: {
                      vars: {
                        firstElement: { $arrayElemAt: ['$$el.entry', 0] }
                      },
                      in: {
                        $arrayElemAt: [
                          { $split: ['$$firstElement.reference', '/'] },
                          1
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'Patient',
          localField: 'extensions.child-details',
          foreignField: 'id',
          as: 'child'
        }
      },
      { $unwind: '$child' },
      {
        $lookup: {
          from: 'Location',
          localField: 'extensionsObject.regLastOffice',
          foreignField: 'id',
          as: 'office'
        }
      },
      { $unwind: '$office' },
      {
        $addFields: {
          'office.district': {
            $arrayElemAt: [{ $split: ['$office.partOf.reference', '/'] }, 1]
          }
        }
      },
      {
        $lookup: {
          from: 'Location',
          localField: 'office.district',
          foreignField: 'id',
          as: 'district'
        }
      },
      { $unwind: '$district' },
      {
        $addFields: {
          'district.state': {
            $arrayElemAt: [{ $split: ['$district.partOf.reference', '/'] }, 1]
          }
        }
      },
      {
        $lookup: {
          from: 'Location',
          localField: 'district.state',
          foreignField: 'id',
          as: 'state'
        }
      },
      { $unwind: '$state' },
      {
        $project: {
          _id: 0,
          id: '$meta.versionId',
          gender: '$child.gender',
          reason: '$reason.text',
          extensions: '$extensions',
          officeName: '$office.name',
          districtName: '$district.name',
          stateName: '$state.name',
          event: 'Birth',
          createdAt: {
            $dateFromString: { dateString: '$lastModified' }
          }
        }
      },
      {
        $out: {
          db: 'performance',
          coll: 'corrections'
        }
      }
    ])
    .toArray()

  await dashboardDb
    .collection('corrections')
    .createIndex({ id: 1 }, { unique: true })
}

export const down = async (db: Db, client: MongoClient) => {
  const dashboardDb = (
    await new MongoClient(DASHBOARD_MONGO_URL).connect()
  ).db()

  dashboardDb.collection('corrections').dropIndex('id_1')
  await db
    .collection('Task')
    .aggregate([
      {
        $unionWith: 'Task_history'
      },
      {
        $match: {
          'extension.url': 'http://opencrvs.org/specs/extension/makeCorrection'
        }
      },
      {
        $addFields: {
          compositionId: {
            $arrayElemAt: [{ $split: ['$focus.reference', '/'] }, 1]
          },
          extensionsObject: {
            $arrayToObject: {
              $map: {
                input: '$extension',
                as: 'el',
                in: [
                  {
                    $replaceOne: {
                      input: '$$el.url',
                      find: 'http://opencrvs.org/specs/extension/',
                      replacement: ''
                    }
                  },
                  {
                    $arrayElemAt: [
                      { $split: ['$$el.valueReference.reference', '/'] },
                      1
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'Composition',
          localField: 'compositionId',
          foreignField: 'id',
          as: 'composition'
        }
      },
      { $unwind: '$composition' },
      {
        $addFields: {
          extensions: {
            $arrayToObject: {
              $map: {
                input: '$composition.section',
                as: 'el',
                in: [
                  {
                    $let: {
                      vars: {
                        firstElement: {
                          $arrayElemAt: ['$$el.code.coding', 0]
                        }
                      },
                      in: '$$firstElement.code'
                    }
                  },
                  {
                    $let: {
                      vars: {
                        firstElement: { $arrayElemAt: ['$$el.entry', 0] }
                      },
                      in: {
                        $arrayElemAt: [
                          { $split: ['$$firstElement.reference', '/'] },
                          1
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'Patient',
          localField: 'extensions.child-details',
          foreignField: 'id',
          as: 'child'
        }
      },
      { $unwind: '$child' },
      {
        $lookup: {
          from: 'Location',
          localField: 'extensionsObject.regLastOffice',
          foreignField: 'id',
          as: 'office'
        }
      },
      { $unwind: '$office' },
      {
        $addFields: {
          'office.district': {
            $arrayElemAt: [{ $split: ['$office.partOf.reference', '/'] }, 1]
          }
        }
      },
      {
        $lookup: {
          from: 'Location',
          localField: 'office.district',
          foreignField: 'id',
          as: 'district'
        }
      },
      { $unwind: '$district' },
      {
        $addFields: {
          'district.state': {
            $arrayElemAt: [{ $split: ['$district.partOf.reference', '/'] }, 1]
          }
        }
      },
      {
        $lookup: {
          from: 'Location',
          localField: 'district.state',
          foreignField: 'id',
          as: 'state'
        }
      },
      { $unwind: '$state' },
      {
        $project: {
          gender: '$child.gender',
          reason: '$reason.text',
          extensions: '$extensions',
          officeName: '$office.name',
          districtName: '$district.name',
          stateName: '$state.name',
          event: 'Birth',
          createdAt: {
            $dateFromString: { dateString: '$lastModified' }
          }
        }
      },
      {
        $out: {
          db: 'performance',
          coll: 'corrections'
        }
      }
    ])
    .toArray()
}

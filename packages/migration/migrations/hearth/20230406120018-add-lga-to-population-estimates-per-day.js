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

export const up = async (db, client) => {
  await db
    .collection('Location')
    .aggregate(
      [
        { $match: { 'identifier.1.value': 'DISTRICT' } },
        {
          $lookup: {
            from: 'Location',
            localField: 'partOf.reference',
            foreignField: '_id',
            as: 'state'
          }
        },
        {
          $addFields: {
            stateId: {
              $arrayElemAt: [{ $split: ['$partOf.reference', '/'] }, 1]
            }
          }
        },
        {
          $lookup: {
            from: 'Location',
            localField: 'stateId',
            foreignField: 'id',
            as: 'stateData'
          }
        },
        {
          $unwind: '$stateData'
        },
        {
          $addFields: {
            districtName: '$name',
            stateName: '$stateData.name'
          }
        },
        {
          $addFields: {
            extensionsObject: {
              $arrayToObject: {
                $map: {
                  input: '$extension',
                  as: 'el',
                  in: [
                    {
                      $replaceOne: {
                        input: '$$el.url',
                        find: 'http://opencrvs.org/specs/id/',
                        replacement: ''
                      }
                    },
                    {
                      $function: {
                        body: `function (jsonString) {
                            return JSON.parse(jsonString)
                          }`,
                        args: ['$$el.valueString'],
                        lang: 'js'
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        { $unwind: '$extensionsObject.statistics-crude-birth-rates' },
        {
          $project: {
            districtName: 1,
            stateName: 1,
            populations: {
              $reduce: {
                input: {
                  $map: {
                    input: '$extensionsObject.statistics-total-populations',
                    as: 'kv',
                    in: {
                      $map: {
                        input: { $objectToArray: '$$kv' },
                        as: 'kv2',
                        in: {
                          year: '$$kv2.k',
                          value: '$$kv2.v'
                        }
                      }
                    }
                  }
                },
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] }
              }
            },
            cbr: {
              $map: {
                input: {
                  $objectToArray:
                    '$extensionsObject.statistics-crude-birth-rates'
                },
                as: 'kv',
                in: {
                  year: '$$kv.k',
                  cbr: '$$kv.v'
                }
              }
            }
          }
        },
        { $unwind: '$cbr' },
        {
          $addFields: {
            daysInYear: {
              $function: {
                body: `function (row) {
                    function daysInYear(year) {
                      return (year % 4 === 0 && year % 100 > 0) || year % 400 == 0
                        ? 366
                        : 365
                    }
                    const year = row.cbr.year
                    const date = new Date(row.cbr.year, 1, 1)
                    const population = row.populations.find(
                      (p) => p.year === year
                    )
                    if (!population) {
                      return []
                    }
                    const totalDays = daysInYear(year)
                    return Array.from({ length: totalDays }, (value, index) => {
                      date.setDate(date.getDate() + 1)
                      return {
                        date: date.toISOString(),
                        estimatedNumberOfBirths:
                          ((population.value / 1000) * row.cbr.cbr) / totalDays
                      }
                    })
                  }`,
                args: ['$$ROOT'],
                lang: 'js'
              }
            }
          }
        },
        { $unwind: '$daysInYear' },
        {
          $project: {
            _id: {
              $concat: [{ $toString: '$districtName' }, '$daysInYear.date']
            },
            lgaName: '$districtName',
            name: '$stateName',
            date: { $dateFromString: { dateString: '$daysInYear.date' } },
            estimatedNumberOfBirths: '$daysInYear.estimatedNumberOfBirths',
            event: 'Birth'
          }
        },
        {
          $out: {
            db: 'analytics',
            coll: 'populationEstimatesPerDay'
          }
        }
      ],
      { allowDiskUse: true }
    )
    .toArray()
}

export const down = async (db, client) => {}

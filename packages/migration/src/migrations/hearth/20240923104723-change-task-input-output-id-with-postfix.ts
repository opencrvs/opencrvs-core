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

const ADDRESS_FIELDS_TO_MIGRATE = [
  'countryPrimary',
  'statePrimary',
  'districtPrimary',
  'ruralOrUrbanPrimary',
  'cityPrimary',
  'addressLine1UrbanOptionPrimary',
  'addressLine2UrbanOptionPrimary',
  'postalCodePrimary',
  'addressLine1RuralOptionPrimary',
  'internationalStatePrimary',
  'internationalDistrictPrimary',
  'internationalCityPrimary',
  'internationalAddressLine1Primary',
  'internationalAddressLine2Primary',
  'internationalAddressLine3Primary',
  'internationalPostalCodePrimary'
]

const addPostFixAggregation = ({
  propertyName
}: {
  propertyName: 'input' | 'output'
}) => [
  {
    $set: {
      [propertyName]: {
        $map: {
          input: `$${propertyName}`,
          as: 'taskUpdate', // Renaming it to separate from input/output in/out methods for clarity.
          in: {
            $mergeObjects: [
              '$$taskUpdate',
              {
                valueId: {
                  $cond: {
                    if: {
                      $in: ['$$taskUpdate.valueId', ADDRESS_FIELDS_TO_MIGRATE]
                    },
                    // Join in camelCase. eg. countryPrimary -> countryPrimaryMother
                    then: {
                      $concat: [
                        '$$taskUpdate.valueId',
                        {
                          $toUpper: {
                            $substr: ['$$taskUpdate.valueCode', 0, 1]
                          }
                        },
                        {
                          $substr: [
                            '$$taskUpdate.valueCode',
                            1,
                            { $strLenCP: '$$taskUpdate.valueCode' }
                          ]
                        }
                      ]
                    },
                    else: '$$taskUpdate.valueId'
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
]

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const propertyNames = ['input', 'output'] as const

      for await (const propertyName of propertyNames) {
        await db.collection('Task').updateMany(
          {
            [propertyName]: { $type: 'array' }
          },
          addPostFixAggregation({ propertyName })
        )

        await db
          .collection('Task_history')
          .updateMany(
            { [propertyName]: { $type: 'array' } },
            addPostFixAggregation({ propertyName })
          )
      }
    })
  } catch (err) {
    console.log('Error occurred while migrating Tasks', err)
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}

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

const LEGACY_INFORMANT_PHONE_VALUE_ID =
  'contactPoint.nestedFields.registrationPhone'
const NEW_INFORMANT_PHONE_VALUE_ID = 'registrationPhone'
const LEGACY_INFORMANT_PHONE_VALUE_CODE = 'registration'
const NEW_INFORMANT_PHONE_VALUE_CODE = 'informant'

const updateInformantPhoneAggregation = ({
  propertyName
}: {
  propertyName: 'input' | 'output'
}) => {
  const isInformantRegistrationPhone = [
    {
      $eq: ['$$taskUpdate.valueId', LEGACY_INFORMANT_PHONE_VALUE_ID]
    },
    {
      $eq: ['$$taskUpdate.valueCode', LEGACY_INFORMANT_PHONE_VALUE_CODE]
    }
  ]

  return [
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
                        $and: isInformantRegistrationPhone
                      },
                      then: NEW_INFORMANT_PHONE_VALUE_ID,
                      else: '$$taskUpdate.valueId'
                    }
                  }
                },
                {
                  valueCode: {
                    $cond: {
                      if: {
                        $and: isInformantRegistrationPhone
                      },
                      then: NEW_INFORMANT_PHONE_VALUE_CODE,
                      else: '$$taskUpdate.valueCode'
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
}

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
          updateInformantPhoneAggregation({ propertyName })
        )

        await db
          .collection('Task_history')
          .updateMany(
            { [propertyName]: { $type: 'array' } },
            updateInformantPhoneAggregation({ propertyName })
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

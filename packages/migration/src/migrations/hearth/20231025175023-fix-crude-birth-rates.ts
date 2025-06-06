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
  const locationExtensionURL =
    'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
  const session = client.startSession()
  let processLocation = 0

  try {
    await session.withTransaction(async () => {
      const locations = await db
        .collection('Location')
        .find({ 'type.coding.0.code': 'ADMIN_STRUCTURE' })
      const locationsCount = await db.collection('Location').countDocuments({})

      console.log(
        `Migration - Crude birth rates to be amended, total ${locationsCount} needs to be processed`
      )

      for await (const location of locations) {
        console.log(
          `Processed ${processLocation + 1}/${locationsCount} , progress ${(
            ((processLocation + 1) / locationsCount) *
            100
          ).toFixed(2)}% ...`
        )
        const updatedExtension = location.extension
        if (updatedExtension) {
          for (const extension of updatedExtension) {
            if (extension.url === locationExtensionURL) {
              const valuesArray = JSON.parse(extension.valueString)
              for (let j = 0; j < valuesArray.length; j++) {
                const year = Object.keys(valuesArray[j])[0]
                const value = valuesArray[j][year] * 2
                valuesArray[j][year] = value
              }
              extension.valueString = JSON.stringify(valuesArray)
            }
          }
        }
        await db.collection('Location').updateOne(
          {
            _id: location._id
          },
          {
            $set: {
              extension: updatedExtension
            }
          }
        )
        processLocation++
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}

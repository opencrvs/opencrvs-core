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
import { isEmpty } from 'lodash-es'

export const up = async (db: Db, client: MongoClient) => {
  const patients = db.collection('Patient')

  const cursor = patients.find<fhir.Patient>({})
  await cursor.forEach((patient) => {
    const updatedAddresses = patient.address?.map((address) => {
      let partOf = address.state

      if (!isEmpty(address.district)) {
        partOf = address.district
      }

      if (!isEmpty(address.line?.[10])) {
        partOf = address.line?.[10]
      }

      if (!isEmpty(address.line?.[11])) {
        partOf = address.line?.[11]
      }

      if (!isEmpty(address.line?.[12])) {
        partOf = address.line?.[12]
      }

      if (partOf) {
        address.extension ??= []
        address.extension.push({
          url: 'http://opencrvs.org/specs/extension/address-location',
          valueReference: {
            reference: `Location/${partOf}`
          }
        })
      }

      return address
    })

    patients.updateOne(
      { _id: patient._id },
      { $set: { address: updatedAddresses } }
    )
  })
}

export const down = async (db: Db, client: MongoClient) => {
  const patients = db.collection('Patient')
  const cursor = patients.find<fhir.Patient>({})
  await cursor.forEach((patient) => {
    const updatedAddresses = patient.address?.map((address) => {
      const extensionsWithoutAddressLocation = address.extension?.filter(
        ({ url }) =>
          url !== 'http://opencrvs.org/specs/extension/address-location'
      )

      if ((extensionsWithoutAddressLocation?.length ?? 0) > 0) {
        return {
          ...address,
          extension: extensionsWithoutAddressLocation
        }
      }

      delete address.extension
      return address
    })

    patients.updateOne(
      { _id: patient._id },
      { $set: { address: updatedAddresses } }
    )
  })
}

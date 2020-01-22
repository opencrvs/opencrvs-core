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

import { MONGO_URL } from '@resources/constants'
import * as mongoose from 'mongoose'
import User, { IUserModel } from '@opencrvs/user-mgnt/src/model/user'
import { getFromFhir, sendToFhir } from '@resources/bgd/features/utils'
import { composeAndSavePractitioners } from '@resources/bgd/features/employees/scripts/service'

export async function updateUsersAndPractitioners() {
  try {
    await mongoose.connect(MONGO_URL)

    /**
     * We have update the information for 'api.user' to make
     * it more specific for DHIS2 system only
     */
    const oldApiUser: IUserModel | null = await User.findOne({
      username: 'api.user'
    })
    if (oldApiUser) {
      oldApiUser.username = 'api.dhis2'
      oldApiUser.scope = ['declare', 'notification-api']
      oldApiUser.name = [
        {
          use: 'en',
          family: 'API',
          given: ['DHIS2']
        }
      ]
      oldApiUser.role = 'NOTIFICATION_API_USER'
      await User.updateOne({ _id: oldApiUser._id }, oldApiUser)
      //Updating practioner name
      if (oldApiUser.practitionerId) {
        const practitioner: fhir.Practitioner = await getFromFhir(
          `/Practitioner/${oldApiUser.practitionerId}`
        )
        practitioner.name = oldApiUser.name
        await sendToFhir(
          practitioner,
          `/Practitioner/${practitioner.id}`,
          'PATCH'
        ).catch(err => {
          throw Error('Cannot update practitioner to FHIR')
        })
      }
    }

    /**
     * Introduced a user 'api.org' with the new role 'VALIDATOR_API_USER'
     * This user is needed to validate pending applications from BRIS1
     */
    const validatorApiUser: IUserModel | null = await User.findOne({
      username: 'api.org'
    })
    if (!validatorApiUser) {
      composeAndSavePractitioners(
        [
          {
            facilityId: 'CRVS_FACILITY000002356',
            environment: 'production',
            username: 'api.org',
            givenNames: 'ORG',
            familyName: 'API',
            gender: 'male',
            role: 'VALIDATOR_API_USER',
            type: 'API_USER',
            mobile: '01622688231',
            email: 'test@test.org',
            signature: ''
          }
        ],
        '',
        '',
        'test'
      )
    }
  } catch (error) {
    throw Error(error)
  } finally {
    await mongoose.disconnect()
  }
}

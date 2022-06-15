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
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'
import { IntlShape } from 'react-intl'
import { createNamesMap } from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import { SearchEventsQuery } from '@client/utils/gateway'
import { LANG_EN } from '@client/utils/constants'

export const transformData = (
  data: SearchEventsQuery['searchEvents'],
  intl: IntlShape
) => {
  const { locale } = intl
  if (!data || !data.results) {
    return []
  }

  return data.results
    .filter((req): req is GQLEventSearchSet => req !== null)
    .map((reg: GQLEventSearchSet) => {
      let birthReg
      let deathReg
      let names
      let dateOfEvent
      const assignedReg = reg as GQLEventSearchSet
      if (assignedReg.registration && assignedReg.type === 'Birth') {
        birthReg = reg as GQLBirthEventSearchSet
        names = (birthReg && (birthReg.childName as GQLHumanName[])) || []
        dateOfEvent = birthReg && birthReg.dateOfBirth
      } else {
        deathReg = reg as GQLDeathEventSearchSet
        names = (deathReg && (deathReg.deceasedName as GQLHumanName[])) || []
        dateOfEvent = deathReg && deathReg.dateOfDeath
      }
      const status =
        assignedReg.registration &&
        (assignedReg.registration.status as GQLRegStatus)

      return {
        id: assignedReg.id,
        name:
          (createNamesMap(names)[locale] as string) ||
          (createNamesMap(names)[LANG_EN] as string) ||
          '',
        dob:
          (birthReg?.dateOfBirth?.length &&
            formatLongDate(birthReg.dateOfBirth, locale)) ||
          '',
        dod:
          (deathReg?.dateOfDeath?.length &&
            formatLongDate(deathReg.dateOfDeath, locale)) ||
          '',
        dateOfEvent,
        registrationNumber:
          (assignedReg.registration &&
            assignedReg.registration.registrationNumber) ||
          '',
        trackingId:
          (assignedReg.registration && assignedReg.registration.trackingId) ||
          '',
        event: assignedReg.type || '',
        declarationStatus: status || '',
        contactNumber:
          (assignedReg.registration &&
            assignedReg.registration.contactNumber) ||
          '',
        duplicates:
          (assignedReg.registration && assignedReg.registration.duplicates) ||
          [],
        rejectionReasons:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.reason) ||
          '',
        rejectionComment:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.comment) ||
          '',
        createdAt: assignedReg?.registration?.createdAt,
        modifiedAt:
          assignedReg.registration &&
          (assignedReg.registration.modifiedAt ||
            assignedReg.registration.createdAt)
      }
    })
}
